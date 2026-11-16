"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import { toggleWishlistAction } from "@/server/actions/wishlist";

type WishlistContextValue = {
  ids: Set<string>;
  count: number;
  isSaved: (productId: string) => boolean;
  toggle: (productId: string, productName?: string) => Promise<void>;
  pendingId: string | null;
  isAuthenticated: boolean;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({
  children,
  initialIds,
  isAuthenticated,
}: {
  children: React.ReactNode;
  initialIds: string[];
  isAuthenticated: boolean;
}) {
  const [ids, setIds] = useState<Set<string>>(() => new Set(initialIds));
  const [pendingId, setPendingId] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const toggle = useCallback(
    async (productId: string, productName?: string) => {
      if (!isAuthenticated) {
        toast("Sign in to save pieces", {
          description: "Your wishlist is saved to your VELORA account.",
          action: {
            label: "Sign in",
            onClick: () =>
              router.push(`/login?next=${encodeURIComponent(pathname)}`),
          },
        });
        return;
      }

      const wasSaved = ids.has(productId);
      setPendingId(productId);
      setIds((current) => {
        const next = new Set(current);
        if (wasSaved) next.delete(productId);
        else next.add(productId);
        return next;
      });

      const result = await toggleWishlistAction(productId);
      setPendingId(null);

      if (!result.ok) {
        setIds((current) => {
          const next = new Set(current);
          if (wasSaved) next.add(productId);
          else next.delete(productId);
          return next;
        });
        toast.error(result.message ?? "Couldn't update your wishlist.");
        return;
      }

      if (result.saved) {
        toast.success("Saved to your wishlist", {
          description: productName,
          action: { label: "View", onClick: () => router.push("/account/wishlist") },
        });
      } else {
        toast.success("Removed from your wishlist", {
          description: productName,
        });
      }
    },
    [ids, isAuthenticated, pathname, router],
  );

  const value = useMemo<WishlistContextValue>(
    () => ({
      ids,
      count: ids.size,
      isSaved: (productId: string) => ids.has(productId),
      toggle,
      pendingId,
      isAuthenticated,
    }),
    [ids, toggle, pendingId, isAuthenticated],
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return context;
}
