"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getCartLines, MAX_QUANTITY_PER_LINE } from "@/lib/cart";
import { db } from "@/lib/db";
import type { CartActionResult } from "@/types/commerce";

const quantitySchema = z.coerce
  .number()
  .int()
  .min(1)
  .max(MAX_QUANTITY_PER_LINE);

const mergeSchema = z
  .array(
    z.object({
      productId: z.string().min(1),
      quantity: z.coerce.number().int().min(1).max(MAX_QUANTITY_PER_LINE),
    }),
  )
  .max(50);

async function currentCart(userId: string) {
  const cart = await getCartLines(userId);
  return {
    cart,
    count: cart.reduce((sum, line) => sum + line.quantity, 0),
  };
}

export async function addToCartAction(
  productId: string,
  quantity = 1,
): Promise<CartActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, requiresAuth: true };

  const parsedQuantity = quantitySchema.safeParse(quantity);
  if (!parsedQuantity.success) {
    return { ok: false, message: "Choose a quantity between 1 and 10." };
  }

  const product = await db.product.findFirst({
    where: { id: productId, isActive: true },
    select: { id: true, stock: true, name: true },
  });

  if (!product) return { ok: false, message: "This product is unavailable." };
  if (product.stock <= 0) {
    return { ok: false, message: `${product.name} is currently sold out.` };
  }

  const existing = await db.cartItem.findUnique({
    where: { userId_productId: { userId: user.id, productId } },
    select: { quantity: true },
  });

  const nextQuantity = Math.min(
    (existing?.quantity ?? 0) + parsedQuantity.data,
    product.stock,
    MAX_QUANTITY_PER_LINE,
  );

  await db.cartItem.upsert({
    where: { userId_productId: { userId: user.id, productId } },
    update: { quantity: nextQuantity },
    create: { userId: user.id, productId, quantity: nextQuantity },
  });

  revalidatePath("/cart");
  const state = await currentCart(user.id);
  return { ok: true, ...state };
}

export async function setCartQuantityAction(
  productId: string,
  quantity: number,
): Promise<CartActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, requiresAuth: true };

  const parsed = quantitySchema.safeParse(quantity);
  if (!parsed.success) return { ok: false, message: "Invalid quantity." };

  const product = await db.product.findFirst({
    where: { id: productId, isActive: true },
    select: { stock: true },
  });

  if (!product) return { ok: false, message: "This product is unavailable." };

  const nextQuantity = Math.min(parsed.data, product.stock);
  if (nextQuantity < 1) {
    await db.cartItem.deleteMany({ where: { userId: user.id, productId } });
  } else {
    await db.cartItem.updateMany({
      where: { userId: user.id, productId },
      data: { quantity: nextQuantity },
    });
  }

  revalidatePath("/cart");
  const state = await currentCart(user.id);
  return { ok: true, ...state };
}

export async function removeFromCartAction(
  productId: string,
): Promise<CartActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, requiresAuth: true };

  await db.cartItem.deleteMany({ where: { userId: user.id, productId } });
  revalidatePath("/cart");
  const state = await currentCart(user.id);
  return { ok: true, ...state };
}

export async function clearCartAction(): Promise<CartActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, requiresAuth: true };

  await db.cartItem.deleteMany({ where: { userId: user.id } });
  revalidatePath("/cart");
  return { ok: true, cart: [], count: 0 };
}

/**
 * Merge a guest's local bag into the signed-in customer's persisted bag.
 * Quantities are clamped to stock to keep checkout reliable.
 */
export async function mergeGuestCartAction(
  items: Array<{ productId: string; quantity: number }>,
): Promise<CartActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, requiresAuth: true };

  const parsed = mergeSchema.safeParse(items);
  if (!parsed.success) return { ok: false, message: "Invalid cart data." };

  const products = await db.product.findMany({
    where: { id: { in: parsed.data.map((item) => item.productId) }, isActive: true },
    select: { id: true, stock: true },
  });
  const stockById = new Map(products.map((product) => [product.id, product.stock]));

  for (const item of parsed.data) {
    const stock = stockById.get(item.productId);
    if (!stock) continue;

    const existing = await db.cartItem.findUnique({
      where: {
        userId_productId: { userId: user.id, productId: item.productId },
      },
      select: { quantity: true },
    });

    const quantity = Math.min(
      (existing?.quantity ?? 0) + item.quantity,
      stock,
      MAX_QUANTITY_PER_LINE,
    );

    if (quantity < 1) continue;

    await db.cartItem.upsert({
      where: {
        userId_productId: { userId: user.id, productId: item.productId },
      },
      update: { quantity },
      create: { userId: user.id, productId: item.productId, quantity },
    });
  }

  revalidatePath("/cart");
  const state = await currentCart(user.id);
  return { ok: true, ...state };
}
