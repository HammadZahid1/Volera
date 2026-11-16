"use server";

import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateOrderNumber, shippingFor } from "@/lib/orders";
import { rateLimit } from "@/lib/rate-limit";
import { checkoutSchema, toFieldErrors, type CheckoutInput } from "@/lib/validation";
import { RECENT_ORDERS_COOKIE } from "@/lib/constants";
import type { OrderResult } from "@/types/commerce";

async function requestIp() {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");
  return (
    forwarded?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    "local"
  );
}

async function uniqueOrderNumber() {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const candidate = generateOrderNumber();
    const exists = await db.order.findUnique({
      where: { orderNumber: candidate },
      select: { id: true },
    });
    if (!exists) return candidate;
  }
  throw new Error("Could not allocate an order number.");
}

async function rememberOrder(orderNumber: string) {
  const store = await cookies();
  const raw = store.get(RECENT_ORDERS_COOKIE)?.value;
  let recent: string[] = [];
  if (raw) {
    try {
      const parsed = z.array(z.string().max(40)).safeParse(JSON.parse(raw));
      if (parsed.success) recent = parsed.data;
    } catch {
      recent = [];
    }
  }
  const next = [orderNumber, ...recent.filter((value) => value !== orderNumber)].slice(0, 6);
  store.set(RECENT_ORDERS_COOKIE, JSON.stringify(next), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export type PlaceOrderInput = Omit<CheckoutInput, "items"> & {
  items: Array<{ productId: string; quantity: number }>;
};

/**
 * Server-authoritative checkout.
 *
 * Prices, stock and shipping are recalculated from the database inside a
 * transaction; the client payload is only used to identify which products and
 * quantities to purchase. Signed-in customers are always checked out from
 * their persisted bag so a tampered payload cannot change the order.
 */
export async function placeOrderAction(input: PlaceOrderInput): Promise<OrderResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the highlighted fields.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const limit = rateLimit(`checkout:${await requestIp()}`, {
    limit: 8,
    windowMs: 10 * 60 * 1000,
  });
  if (!limit.success) {
    return {
      ok: false,
      message: `Too many checkout attempts. Try again in ${limit.retryAfter} seconds.`,
    };
  }

  const user = await getCurrentUser();

  // Replay protection for double-clicks and flaky networks.
  const existingOrder = await db.order.findUnique({
    where: { idempotencyKey: parsed.data.idempotencyKey },
    select: { orderNumber: true, userId: true },
  });
  if (existingOrder) {
    if (!user || existingOrder.userId === user.id || existingOrder.userId === null) {
      await rememberOrder(existingOrder.orderNumber);
      return { ok: true, orderNumber: existingOrder.orderNumber };
    }
  }

  const requested = new Map<string, number>();
  if (user) {
    const rows = await db.cartItem.findMany({
      where: { userId: user.id },
      select: { productId: true, quantity: true },
    });
    for (const row of rows) requested.set(row.productId, row.quantity);
  } else {
    for (const item of parsed.data.items) {
      requested.set(item.productId, Math.min(20, (requested.get(item.productId) ?? 0) + item.quantity));
    }
  }

  if (requested.size === 0) {
    return { ok: false, message: "Your bag is empty." };
  }

  const products = await db.product.findMany({
    where: { id: { in: [...requested.keys()] }, isActive: true },
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
  });

  if (products.length !== requested.size) {
    return { ok: false, message: "One or more pieces in your bag are no longer available." };
  }

  for (const product of products) {
    const quantity = requested.get(product.id) ?? 0;
    if (quantity < 1) {
      return { ok: false, message: "One or more quantities are invalid." };
    }
    if (product.stock < quantity) {
      return {
        ok: false,
        message: `Only ${product.stock} of ${product.name} remain. Update your bag to continue.`,
      };
    }
  }

  const subtotal = products.reduce(
    (sum, product) => sum + product.price * (requested.get(product.id) ?? 0),
    0,
  );
  const shippingCost = shippingFor(subtotal);
  const orderNumber = await uniqueOrderNumber();

  try {
    await db.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: user?.id ?? null,
          customerName: parsed.data.fullName,
          email: parsed.data.email,
          phone: parsed.data.phone,
          shippingAddress: parsed.data.address,
          city: parsed.data.city,
          postalCode: parsed.data.postalCode,
          deliveryInstructions: parsed.data.deliveryInstructions,
          subtotal,
          shippingCost,
          total: subtotal + shippingCost,
          paymentMethod: "demo",
          paymentStatus: "not_charged",
          orderStatus: "confirmed",
          idempotencyKey: parsed.data.idempotencyKey,
          items: {
            create: products.map((product) => {
              const quantity = requested.get(product.id) ?? 0;
              return {
                productId: product.id,
                productName: product.name,
                productSlug: product.slug,
                productImage: product.images[0]?.url ?? "",
                unitPrice: product.price,
                quantity,
                subtotal: product.price * quantity,
              };
            }),
          },
        },
      });

      for (const product of products) {
        const quantity = requested.get(product.id) ?? 0;
        const updated = await tx.product.updateMany({
          where: { id: product.id, stock: { gte: quantity } },
          data: { stock: { decrement: quantity } },
        });
        if (updated.count !== 1) {
          throw new Error("STOCK_CHANGED");
        }
      }

      if (user) {
        await tx.cartItem.deleteMany({ where: { userId: user.id } });
      }

      return order;
    });
  } catch (error) {
    if (error instanceof Error && error.message === "STOCK_CHANGED") {
      return {
        ok: false,
        message: "Stock changed while you were checking out. Review your bag and try again.",
      };
    }
    return {
      ok: false,
      message: "We couldn't place the order. Please try again.",
    };
  }

  await rememberOrder(orderNumber);
  revalidatePath("/cart");
  revalidatePath("/account/orders");

  return { ok: true, orderNumber, message: "Order placed." };
}
