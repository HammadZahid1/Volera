import { db } from "@/lib/db";
import { SHIPPING } from "@/lib/constants";

export const MAX_QUANTITY_PER_LINE = 10;

export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  image: string;
  imageAlt: string;
  stock: number;
  quantity: number;
  isAvailable: boolean;
};

export type CartTotals = {
  subtotal: number;
  shipping: number;
  total: number;
  itemCount: number;
};

/** Load a signed-in customer's persisted cart, clamped to current stock. */
export async function getCartLines(userId: string): Promise<CartLine[]> {
  const rows = await db.cartItem.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          images: { orderBy: { position: "asc" }, take: 1 },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return rows
    .filter((row) => row.product.isActive)
    .map((row) => ({
      productId: row.productId,
      slug: row.product.slug,
      name: row.product.name,
      price: row.product.price,
      compareAtPrice: row.product.compareAtPrice,
      image: row.product.images[0]?.url ?? "",
      imageAlt: row.product.images[0]?.alt ?? row.product.name,
      stock: row.product.stock,
      quantity: Math.min(row.quantity, row.product.stock, MAX_QUANTITY_PER_LINE),
      isAvailable: row.product.stock > 0,
    }))
    .filter((line) => line.quantity > 0 || line.isAvailable);
}

export function cartSubtotal(lines: Array<{ price: number; quantity: number }>) {
  return lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
}

export function shippingCostFor(subtotal: number) {
  return subtotal >= SHIPPING.freeThreshold ? 0 : SHIPPING.flatRate;
}

export function cartTotals(
  lines: Array<{ price: number; quantity: number }>,
): CartTotals {
  const subtotal = cartSubtotal(lines);
  const shipping = subtotal > 0 ? shippingCostFor(subtotal) : 0;
  return {
    subtotal,
    shipping,
    total: subtotal + shipping,
    itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
  };
}

export async function getCartCount(userId: string) {
  const result = await db.cartItem.aggregate({
    where: { userId },
    _sum: { quantity: true },
  });
  return result._sum.quantity ?? 0;
}

export function isValidQuantity(value: number, stock: number) {
  return (
    Number.isInteger(value) &&
    value >= 1 &&
    value <= Math.min(stock, MAX_QUANTITY_PER_LINE)
  );
}
