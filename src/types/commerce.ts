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

export type ActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  requiresAuth?: boolean;
};

export type CartActionResult = ActionState & {
  cart?: CartLine[];
  count?: number;
};

export type WishlistActionResult = ActionState & {
  saved?: boolean;
};

export type OrderResult = ActionState & {
  orderNumber?: string;
};

export type AdminActionResult = ActionState & {
  id?: string;
  slug?: string;
};
