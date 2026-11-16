"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Check, Loader2, Plus } from "lucide-react";
import { WishlistButton } from "@/components/product/wishlist-button";
import { useCart } from "@/components/cart/cart-provider";
import { RatingStars } from "@/components/ui/rating";
import { Badge } from "@/components/ui/badge";
import { toCartLine } from "@/lib/cart-line";
import type { ProductCardData } from "@/lib/products";
import { cn, discountPercent, formatPrice } from "@/lib/utils";

export function ProductCard({
  product,
  priority = false,
  className,
}: {
  product: ProductCardData;
  priority?: boolean;
  className?: string;
}) {
  const { addItem, isPending } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const soldOut = product.stock <= 0;
  const discount = discountPercent(product.price, product.compareAtPrice);
  const lowStock = !soldOut && product.stock <= 5;

  const handleAdd = async () => {
    if (soldOut) return;
    setAdding(true);
    await addItem(toCartLine(product));
    setAdding(false);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  return (
    <article className={cn("group/card relative flex flex-col", className)}>
      <div className="relative overflow-hidden rounded-2xl border border-line-soft bg-surface">
        <Link
          href={`/product/${product.slug}`}
          className="relative block aspect-[4/5] overflow-hidden"
          aria-label={`View ${product.name}`}
        >
          {product.image.url ? (
            <Image
              src={product.image.url}
              alt={product.image.alt}
              fill
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover/card:scale-[1.06]"
            />
          ) : (
            <div className="grid h-full w-full place-items-center bg-card text-xs text-subtle">
              Image coming soon
            </div>
          )}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
          />
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {product.isNew ? (
            <Badge variant="accent" className="pointer-events-auto bg-canvas/80 backdrop-blur">
              New
            </Badge>
          ) : null}
          {discount ? (
            <Badge variant="solid" className="pointer-events-auto">
              −{discount}%
            </Badge>
          ) : null}
          {soldOut ? (
            <Badge variant="neutral" className="pointer-events-auto bg-canvas/80 backdrop-blur">
              Sold out
            </Badge>
          ) : null}
        </div>

        <WishlistButton
          productId={product.id}
          productName={product.name}
          className="absolute right-3 top-3"
        />

        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2">
          <span className="pointer-events-none rounded-full border border-white/10 bg-black/45 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-white/75 backdrop-blur-md opacity-0 transition-opacity duration-300 group-hover/card:opacity-100 max-sm:hidden">
            {product.category.name}
          </span>
          <button
            type="button"
            onClick={handleAdd}
            disabled={soldOut || adding || isPending}
            aria-label={soldOut ? `${product.name} is sold out` : `Add ${product.name} to bag`}
            className={cn(
              "ml-auto inline-flex h-10 items-center gap-2 rounded-full border border-white/15 bg-black/55 px-3.5 text-[13px] font-medium text-white backdrop-blur-md transition-all duration-300",
              "hover:border-accent/60 hover:bg-accent hover:text-[#0a0a10]",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "sm:pointer-events-none sm:translate-y-1.5 sm:opacity-0 sm:group-hover/card:pointer-events-auto sm:group-hover/card:translate-y-0 sm:group-hover/card:opacity-100 sm:focus-visible:pointer-events-auto sm:focus-visible:translate-y-0 sm:focus-visible:opacity-100",
            )}
          >
            {adding ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : added ? (
              <Check className="size-4" aria-hidden />
            ) : (
              <Plus className="size-4" aria-hidden />
            )}
            <span>{soldOut ? "Sold out" : added ? "Added" : "Quick add"}</span>
          </button>
        </div>
      </div>

      <div className="mt-3.5 flex flex-1 flex-col px-0.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[14px] font-medium leading-snug tracking-[-0.01em] text-content">
            <Link
              href={`/product/${product.slug}`}
              className="transition-colors hover:text-accent-bright"
            >
              {product.name}
            </Link>
          </h3>
          <div className="shrink-0 text-right">
            <p className="text-[14px] font-medium tabular-nums text-content">
              {formatPrice(product.price)}
            </p>
            {product.compareAtPrice && product.compareAtPrice > product.price ? (
              <p className="text-[11px] tabular-nums text-subtle line-through">
                {formatPrice(product.compareAtPrice)}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
          {lowStock ? (
            <span className="text-[11px] font-medium text-warning">
              Only {product.stock} left
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
