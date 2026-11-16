"use client";

import { useState } from "react";
import { Check, Heart, Loader2, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { useWishlist } from "@/components/wishlist/wishlist-provider";
import { QuantityStepper } from "@/components/cart/quantity-stepper";
import { Button } from "@/components/ui/button";
import { toCartLine } from "@/lib/cart-line";
import { cn, formatPrice } from "@/lib/utils";

export function ProductPurchase({
  product,
}: {
  product: {
    id: string;
    slug: string;
    name: string;
    price: number;
    compareAtPrice: number | null;
    stock: number;
    image: { url: string; alt: string };
  };
}) {
  const { addItem, isPending, openCart } = useCart();
  const { isSaved, toggle, pendingId } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const soldOut = product.stock <= 0;
  const maxQuantity = Math.max(1, Math.min(product.stock, 10));
  const saved = isSaved(product.id);
  const wishlistPending = pendingId === product.id;

  const onAdd = async () => {
    if (soldOut) return;
    setAdding(true);
    await addItem(toCartLine(product), quantity);
    setAdding(false);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <QuantityStepper
          value={quantity}
          onChange={setQuantity}
          max={maxQuantity}
          disabled={soldOut || adding}
          label={`Quantity of ${product.name}`}
        />
        <span className="text-[11px] text-subtle">
          {soldOut
            ? "Currently unavailable"
            : product.stock <= 5
              ? `Only ${product.stock} left in stock`
              : "In stock, ready to ship"}
        </span>
      </div>

      <div className="flex flex-col gap-2.5 sm:flex-row">
        <Button
          type="button"
          size="lg"
          className="flex-1"
          onClick={onAdd}
          loading={adding}
          disabled={soldOut || isPending}
        >
          {!adding ? (
            added ? (
              <Check className="size-4" aria-hidden />
            ) : (
              <ShoppingBag className="size-4" aria-hidden />
            )
          ) : null}
          {soldOut ? "Sold out" : added ? "Added to bag" : "Add to bag"}
          {!soldOut && !added ? (
            <span className="text-[12px] text-[#0a0a10]/60">
              · {formatPrice(product.price * quantity)}
            </span>
          ) : null}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={() => void toggle(product.id, product.name)}
          disabled={wishlistPending}
          aria-pressed={saved}
          className={cn(saved && "border-accent/40 text-accent-bright")}
        >
          {wishlistPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Heart className={cn("size-4", saved && "fill-current")} aria-hidden />
          )}
          {saved ? "Saved" : "Save"}
        </Button>
      </div>

      {added ? (
        <button
          type="button"
          onClick={openCart}
          className="text-[12px] text-accent-bright underline-offset-4 hover:underline"
        >
          View your bag →
        </button>
      ) : null}
    </div>
  );
}
