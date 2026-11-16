export const SITE = {
  name: "VELORA",
  tagline: "Elevate your everyday.",
  description:
    "Thoughtfully selected essentials designed for modern living — audio, timepieces, leather goods, and objects for the considered home.",
  email: "hello@velora.store",
  supportEmail: "support@velora.store",
  location: "Copenhagen · New York",
  social: {
    instagram: "https://instagram.com",
    x: "https://x.com",
    pinterest: "https://pinterest.com",
  },
} as const;

export const PRIMARY_NAV = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Collections", href: "/collections" },
  { label: "New Arrivals", href: "/new-arrivals" },
  { label: "About", href: "/about" },
] as const;

export const FOOTER_LINKS = {
  shop: [
    { label: "All Products", href: "/shop" },
    { label: "New Arrivals", href: "/new-arrivals" },
    { label: "Collections", href: "/collections" },
    { label: "Audio", href: "/shop?category=audio" },
    { label: "Timepieces", href: "/shop?category=watches" },
  ],
  support: [
    { label: "Contact", href: "/about#contact" },
    { label: "Shipping & Delivery", href: "/about#shipping" },
    { label: "Returns", href: "/about#returns" },
    { label: "Track an Order", href: "/account/orders" },
    { label: "FAQ", href: "/about#faq" },
  ],
  company: [
    { label: "Our Story", href: "/about" },
    { label: "Journal", href: "/about#journal" },
    { label: "Careers", href: "/about#careers" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms & Conditions", href: "/terms" },
  ],
} as const;

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const SHIPPING = {
  flatRate: 900,
  freeThreshold: 15000,
  expressRate: 1800,
} as const;

export const CART_STORAGE_KEY = "velora.cart.v1";
export const RECENT_ORDERS_COOKIE = "velora_recent_orders";

export const CURRENCY = "USD" as const;

export const DEFAULT_PAGE_SIZE = 12;

export const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Best Rated" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];
