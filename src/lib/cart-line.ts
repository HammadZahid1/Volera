import type { CartLine } from "@/types/commerce";

/** Shape shared by catalog cards and product detail, mapped to a bag line. */
export type CartLineSource = {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  image: { url: string; alt: string };
};

/** Build a localStorage/optimistic cart line from product data. */
export function toCartLine(product: CartLineSource): CartLine {
  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    image: product.image.url,
    imageAlt: product.image.alt,
    stock: product.stock,
    quantity: 1,
    isAvailable: product.stock > 0,
  };
}
