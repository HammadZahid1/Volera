"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  adminProductSchema,
  orderStatusField,
  toFieldErrors,
  type AdminProductInput,
} from "@/lib/validation";
import type { AdminActionResult } from "@/types/commerce";

type ProductFormInput = {
  name: string;
  slug: string;
  sku: string;
  description: string;
  details: string;
  price: string | number;
  compareAtPrice?: string | number;
  categoryId: string;
  stock: string | number;
  rating: string | number;
  reviewCount: string | number;
  isFeatured: boolean;
  isNew: boolean;
  isActive: boolean;
  images: string[];
};

function productData(input: AdminProductInput) {
  return {
    name: input.name,
    slug: input.slug,
    sku: input.sku,
    description: input.description,
    details: input.details,
    price: Math.round(input.price * 100),
    compareAtPrice:
      input.compareAtPrice === "" || input.compareAtPrice === undefined
        ? null
        : Math.round(input.compareAtPrice * 100),
    categoryId: input.categoryId,
    stock: input.stock,
    rating: input.rating,
    reviewCount: input.reviewCount,
    isFeatured: input.isFeatured,
    isNew: input.isNew,
    isActive: input.isActive,
  };
}

function imageRows(images: AdminProductInput["images"], name: string) {
  return images.map((url, index) => ({
    url,
    alt: `${name} — view ${index + 1}`,
    position: index,
  }));
}

async function validateProduct(input: ProductFormInput, productId?: string) {
  const parsed = adminProductSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      message: "Check the highlighted fields.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const category = await db.category.findUnique({
    where: { id: parsed.data.categoryId },
    select: { id: true },
  });
  if (!category) {
    return {
      ok: false as const,
      message: "Choose a valid collection.",
      fieldErrors: { categoryId: ["Choose a valid collection."] },
    };
  }

  const conflict = await db.product.findFirst({
    where: {
      OR: [{ slug: parsed.data.slug }, { sku: parsed.data.sku }],
      ...(productId ? { NOT: { id: productId } } : {}),
    },
    select: { slug: true, sku: true },
  });

  if (conflict) {
    const fieldErrors: Record<string, string[]> = {};
    if (conflict.slug === parsed.data.slug) {
      fieldErrors.slug = ["Another product already uses this slug."];
    }
    if (conflict.sku === parsed.data.sku) {
      fieldErrors.sku = ["Another product already uses this SKU."];
    }
    return {
      ok: false as const,
      message: "That product is already in the catalogue.",
      fieldErrors,
    };
  }

  return { ok: true as const, data: parsed.data };
}

function revalidateProducts(slugs: string[]) {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/new-arrivals");
  revalidatePath("/collections");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  for (const slug of new Set(slugs)) {
    revalidatePath(`/product/${slug}`);
  }
}

export async function createProductAction(
  input: ProductFormInput,
): Promise<AdminActionResult> {
  await requireAdmin("/admin/products/new");

  const validated = await validateProduct(input);
  if (!validated.ok) {
    return {
      ok: false,
      message: validated.message,
      fieldErrors: validated.fieldErrors,
    };
  }

  const data = productData(validated.data);
  const product = await db.product.create({
    data: {
      ...data,
      images: { create: imageRows(validated.data.images, validated.data.name) },
    },
    select: { id: true, slug: true },
  });

  revalidateProducts([product.slug]);
  return {
    ok: true,
    message: `${validated.data.name} added to the catalogue.`,
    id: product.id,
    slug: product.slug,
  };
}

export async function updateProductAction(
  productId: string,
  input: ProductFormInput,
): Promise<AdminActionResult> {
  await requireAdmin(`/admin/products/${productId}/edit`);

  const existing = await db.product.findUnique({
    where: { id: productId },
    select: { id: true, slug: true },
  });
  if (!existing) return { ok: false, message: "Product not found." };

  const validated = await validateProduct(input, productId);
  if (!validated.ok) {
    return {
      ok: false,
      message: validated.message,
      fieldErrors: validated.fieldErrors,
    };
  }

  const data = productData(validated.data);

  await db.$transaction(async (tx) => {
    await tx.product.update({ where: { id: productId }, data });
    await tx.productImage.deleteMany({ where: { productId } });
    await tx.productImage.createMany({
      data: imageRows(validated.data.images, validated.data.name).map(
        (image) => ({ ...image, productId }),
      ),
    });
  });

  revalidateProducts([existing.slug, validated.data.slug]);
  return {
    ok: true,
    message: `${validated.data.name} updated.`,
    id: productId,
    slug: validated.data.slug,
  };
}

export async function setProductActiveAction(
  productId: string,
  isActive: boolean,
): Promise<AdminActionResult> {
  await requireAdmin("/admin/products");

  const product = await db.product.findUnique({
    where: { id: productId },
    select: { id: true, slug: true, name: true },
  });
  if (!product) return { ok: false, message: "Product not found." };

  await db.product.update({ where: { id: productId }, data: { isActive } });
  revalidateProducts([product.slug]);

  return {
    ok: true,
    message: isActive
      ? `${product.name} is live in the catalogue.`
      : `${product.name} archived. It is hidden from the storefront.`,
    id: product.id,
    slug: product.slug,
  };
}

export async function deleteProductAction(
  productId: string,
): Promise<AdminActionResult> {
  await requireAdmin("/admin/products");

  const product = await db.product.findUnique({
    where: { id: productId },
    select: { id: true, slug: true, name: true },
  });
  if (!product) return { ok: false, message: "Product not found." };

  const orderLines = await db.orderItem.count({ where: { productId } });
  if (orderLines > 0) {
    return {
      ok: false,
      message:
        "This piece appears on existing orders. Archive it instead so order history stays intact.",
    };
  }

  await db.product.delete({ where: { id: productId } });
  revalidateProducts([product.slug]);
  return {
    ok: true,
    message: `${product.name} deleted.`,
    id: product.id,
    slug: product.slug,
  };
}

const orderStatusInput = z.object({
  orderId: z.string().min(1),
  status: orderStatusField,
});

/**
 * Move an order through its lifecycle. Cancelling returns reserved stock;
 * reopening a cancelled order reserves it again, and refuses if stock is gone.
 */
export async function updateOrderStatusAction(input: {
  orderId: string;
  status: string;
}): Promise<AdminActionResult> {
  await requireAdmin("/admin/orders");

  const parsed = orderStatusInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Choose a valid order status." };
  }

  const order = await db.order.findUnique({
    where: { id: parsed.data.orderId },
    include: {
      items: { select: { productId: true, quantity: true } },
    },
  });
  if (!order) return { ok: false, message: "Order not found." };

  if (order.orderStatus === parsed.data.status) {
    return {
      ok: true,
      message: `Order is already marked ${parsed.data.status}.`,
    };
  }

  const lines = order.items.filter((item) => item.productId);

  try {
    await db.$transaction(async (tx) => {
      if (
        parsed.data.status === "cancelled" &&
        order.orderStatus !== "cancelled"
      ) {
        for (const line of lines) {
          await tx.product.updateMany({
            where: { id: line.productId! },
            data: { stock: { increment: line.quantity } },
          });
        }
      }

      if (
        order.orderStatus === "cancelled" &&
        parsed.data.status !== "cancelled"
      ) {
        for (const line of lines) {
          const updated = await tx.product.updateMany({
            where: {
              id: line.productId!,
              stock: { gte: line.quantity },
            },
            data: { stock: { decrement: line.quantity } },
          });
          if (updated.count !== 1) throw new Error("STOCK_UNAVAILABLE");
        }
      }

      await tx.order.update({
        where: { id: order.id },
        data: { orderStatus: parsed.data.status },
      });
    });
  } catch (error) {
    if (error instanceof Error && error.message === "STOCK_UNAVAILABLE") {
      return {
        ok: false,
        message:
          "Cannot reopen this order — the reserved stock is no longer available.",
      };
    }
    return {
      ok: false,
      message: "We couldn't update the order status. Try again.",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${order.id}`);
  revalidatePath("/account/orders");
  revalidatePath(`/account/orders/${order.orderNumber}`);
  revalidatePath(`/order/${order.orderNumber}`);

  return {
    ok: true,
    message: `Order ${order.orderNumber} marked ${parsed.data.status}.`,
    id: order.id,
  };
}
