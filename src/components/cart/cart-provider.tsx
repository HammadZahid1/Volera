"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import { z } from "zod";
import {
  addToCartAction,
  clearCartAction,
  mergeGuestCartAction,
  removeFromCartAction,
  setCartQuantityAction,
} from "@/server/actions/cart";
import { CART_STORAGE_KEY, SHIPPING } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import type { CartLine } from "@/types/commerce";

const MAX_PER_LINE = 10;

const storedCartSchema = z.array(
  z.object({
    productId: z.string().min(1),
    slug: z.string(),
    name: z.string(),
    price: z.number().int().nonnegative(),
    compareAtPrice: z.number().int().nullable(),
    image: z.string(),
    imageAlt: z.string(),
    stock: z.number().int().nonnegative(),
    quantity: z.number().int().min(1).max(MAX_PER_LINE),
    isAvailable: z.boolean(),
  }),
);

type CartContextValue = {
  items: CartLine[];
  count: number;
  subtotal: number;
  isHydrated: boolean;
  isPending: boolean;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (line: CartLine, quantity?: number) => Promise<void>;
  setQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clear: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

function readGuestCart(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = storedCartSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

function writeGuestCart(items: CartLine[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage can be unavailable in private browsing; the bag still works
    // for the current session.
  }
}

export function CartProvider({
  children,
  initialCart,
  isAuthenticated,
}: {
  children: React.ReactNode;
  initialCart: CartLine[];
  isAuthenticated: boolean;
}) {
  const [items, setItems] = useState<CartLine[]>(
    isAuthenticated ? initialCart : [],
  );
  const [isHydrated, setHydrated] = useState(false);
  const [isPending, setPending] = useState(false);
  const [isOpen, setOpen] = useState(false);

  // Hydrate guest bags or merge a pre-login bag into the account once.
  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      const guest = readGuestCart();

      if (isAuthenticated) {
        if (guest.length > 0) {
          const result = await mergeGuestCartAction(
            guest.map((line) => ({
              productId: line.productId,
              quantity: line.quantity,
            })),
          );
          if (cancelled) return;
          if (result.ok && result.cart) setItems(result.cart);
          writeGuestCart([]);
        }
      } else if (guest.length > 0) {
        setItems(guest);
      }

      if (!cancelled) setHydrated(true);
    };

    hydrate().catch(() => setHydrated(true));
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  // Keep guest bags in sync across tabs.
  useEffect(() => {
    if (isAuthenticated || !isHydrated) return;
    const onStorage = (event: StorageEvent) => {
      if (event.key === CART_STORAGE_KEY) setItems(readGuestCart());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [isAuthenticated, isHydrated]);

  useEffect(() => {
    if (!isAuthenticated && isHydrated) writeGuestCart(items);
  }, [items, isAuthenticated, isHydrated]);

  const count = useMemo(
    () => items.reduce((sum, line) => sum + line.quantity, 0),
    [items],
  );
  const subtotal = useMemo(
    () => items.reduce((sum, line) => sum + line.price * line.quantity, 0),
    [items],
  );

  const openCart = useCallback(() => setOpen(true), []);
  const closeCart = useCallback(() => setOpen(false), []);

  const addItem = useCallback(
    async (line: CartLine, quantity = 1) => {
      if (line.stock <= 0) {
        toast.error(`${line.name} is currently sold out.`);
        return;
      }

      const existing = items.find((item) => item.productId === line.productId);
      const desired = Math.min(
        (existing?.quantity ?? 0) + quantity,
        line.stock,
        MAX_PER_LINE,
      );

      if (existing && desired === existing.quantity) {
        toast.info("Maximum available quantity reached", {
          description: `You can add up to ${Math.min(line.stock, MAX_PER_LINE)} of ${line.name}.`,
        });
        return;
      }

      setPending(true);
      const optimistic = existing
        ? items.map((item) =>
            item.productId === line.productId
              ? { ...item, quantity: desired, stock: line.stock }
              : item,
          )
        : [...items, { ...line, quantity: desired }];
      setItems(optimistic);

      if (isAuthenticated) {
        const result = await addToCartAction(line.productId, quantity);
        setPending(false);
        if (!result.ok) {
          setItems(items);
          if (result.requiresAuth) {
            toast.error("Your session expired. Sign in and try again.");
          } else {
            toast.error(result.message ?? "Couldn't add that to your bag.");
          }
          return;
        }
        if (result.cart) setItems(result.cart);
      } else {
        setPending(false);
      }

      toast.success("Added to your bag", {
        description: `${line.name} · ${formatPrice(line.price)}`,
        action: { label: "View bag", onClick: openCart },
      });
    },
    [items, isAuthenticated, openCart],
  );

  const setQuantity = useCallback(
    async (productId: string, quantity: number) => {
      const line = items.find((item) => item.productId === productId);
      if (!line) return;

      const next = Math.max(
        1,
        Math.min(quantity, line.stock, MAX_PER_LINE),
      );

      setPending(true);
      const previous = items;
      setItems(
        items.map((item) =>
          item.productId === productId ? { ...item, quantity: next } : item,
        ),
      );

      if (isAuthenticated) {
        const result = await setCartQuantityAction(productId, next);
        setPending(false);
        if (!result.ok) {
          setItems(previous);
          toast.error(result.message ?? "Couldn't update the quantity.");
          return;
        }
        if (result.cart) setItems(result.cart);
      } else {
        setPending(false);
      }
    },
    [items, isAuthenticated],
  );

  const removeItem = useCallback(
    async (productId: string) => {
      const previous = items;
      const line = items.find((item) => item.productId === productId);
      setItems(items.filter((item) => item.productId !== productId));

      if (isAuthenticated) {
        const result = await removeFromCartAction(productId);
        if (!result.ok) {
          setItems(previous);
          toast.error(result.message ?? "Couldn't remove that item.");
          return;
        }
        if (result.cart) setItems(result.cart);
      }

      if (line) {
        toast.success("Removed from your bag", { description: line.name });
      }
    },
    [items, isAuthenticated],
  );

  const clear = useCallback(async () => {
    const previous = items;
    setItems([]);
    if (isAuthenticated) {
      const result = await clearCartAction();
      if (!result.ok) {
        setItems(previous);
        toast.error("Couldn't clear your bag.");
      }
    }
  }, [items, isAuthenticated]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count,
      subtotal,
      isHydrated,
      isPending,
      isOpen,
      openCart,
      closeCart,
      addItem,
      setQuantity,
      removeItem,
      clear,
    }),
    [
      items,
      count,
      subtotal,
      isHydrated,
      isPending,
      isOpen,
      openCart,
      closeCart,
      addItem,
      setQuantity,
      removeItem,
      clear,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}

export { SHIPPING };
