"use client";

import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { useWishlist } from "@/components/wishlist/wishlist-provider";
import { ProductGrid } from "@/components/product/product-grid";
import { EmptyState } from "@/components/ui/section";
import { buttonVariants } from "@/components/ui/button";
import type { ProductCardData } from "@/lib/products";

export function WishlistGrid({ products }: { products: ProductCardData[] }) {
  const { ids } = useWishlist();
  const visible = products.filter((product) => ids.has(product.id));

  if (visible.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="Nothing saved yet"
        description="Tap the heart on any piece to keep it here. Saved pieces stay with your account across devices."
        action={
          <Link href="/shop" className={buttonVariants({ size: "md" })}>
            <ShoppingBag className="size-4" aria-hidden />
            Explore the collection
          </Link>
        }
      />
    );
  }

  return <ProductGrid products={visible} columns={3} />;
}
