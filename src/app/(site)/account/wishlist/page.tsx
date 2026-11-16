import type { Metadata } from "next";
import { WishlistGrid } from "@/components/account/wishlist-grid";
import { requireUser } from "@/lib/auth";
import { getWishlistProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Pieces saved to your VELORA account.",
  robots: { index: false, follow: false },
};

export default async function AccountWishlistPage() {
  const user = await requireUser("/account/wishlist");
  const products = await getWishlistProducts(user.id);

  return (
    <div className="space-y-7">
      <header className="max-w-xl">
        <p className="eyebrow">Saved for later</p>
        <h1 className="display mt-2 text-[clamp(1.9rem,4vw,2.7rem)] leading-[1.05] text-content">
          Your wishlist.
        </h1>
        <p className="mt-2.5 text-sm leading-relaxed text-muted">
          A considered shortlist. Remove a piece with its heart icon, or move it
          to your bag when you are ready.
        </p>
      </header>

      <WishlistGrid products={products} />
    </div>
  );
}
