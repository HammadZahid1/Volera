"use client";

import { Heart, Loader2 } from "lucide-react";
import { useWishlist } from "@/components/wishlist/wishlist-provider";
import { cn } from "@/lib/utils";

export function WishlistButton({
  productId,
  productName,
  className,
  size = "md",
}: {
  productId: string;
  productName: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const { isSaved, toggle, pendingId } = useWishlist();
  const saved = isSaved(productId);
  const pending = pendingId === productId;

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void toggle(productId, productName);
      }}
      aria-label={saved ? `Remove ${productName} from wishlist` : `Save ${productName} to wishlist`}
      aria-pressed={saved}
      disabled={pending}
      className={cn(
        "group/wish grid place-items-center rounded-full border backdrop-blur-md transition-all duration-300",
        size === "sm" ? "size-8" : "size-9",
        saved
          ? "border-accent/40 bg-accent/20 text-accent-bright"
          : "border-white/15 bg-black/35 text-white/80 hover:border-white/30 hover:bg-black/55 hover:text-white",
        className,
      )}
    >
      {pending ? (
        <Loader2 className="size-3.5 animate-spin" aria-hidden />
      ) : (
        <Heart
          className={cn(
            "size-4 transition-transform duration-300 group-hover/wish:scale-110",
            saved && "fill-current",
          )}
          aria-hidden
        />
      )}
    </button>
  );
}
