"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingBag,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { SearchDialog } from "@/components/layout/search-dialog";
import { UserMenu, type NavUser } from "@/components/layout/user-menu";
import { useWishlist } from "@/components/wishlist/wishlist-provider";
import { Drawer } from "@/components/ui/overlay";
import { Logo } from "@/components/ui/logo";
import { PRIMARY_NAV, SITE } from "@/lib/constants";
import { logoutAction } from "@/server/actions/auth";
import { cn, formatPrice, initials } from "@/lib/utils";

type Category = { name: string; slug: string };

export function Navbar({
  user,
  categories,
}: {
  user: NavUser | null;
  categories: Category[];
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const { count, isHydrated, openCart, subtotal } = useCart();
  const { count: wishlistCount } = useWishlist();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setCollectionsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header className="sticky top-0 z-50">
        <div className="hidden border-b border-line-soft/70 bg-surface/80 backdrop-blur-md sm:block">
          <p className="container-page flex h-8 items-center justify-center gap-2 text-[10px] uppercase tracking-[0.16em] text-subtle">
            <span>Complimentary shipping over {formatPrice(15000)}</span>
            <span aria-hidden className="text-line">·</span>
            <span>30-day returns</span>
            <span aria-hidden className="text-line">·</span>
            <span>Demo storefront</span>
          </p>
        </div>

        <div
          className={cn(
            "border-b transition-colors duration-300",
            scrolled || mobileOpen || collectionsOpen
              ? "border-line/80 bg-canvas/85 backdrop-blur-xl supports-[backdrop-filter]:bg-canvas/70"
              : "border-transparent bg-canvas/30 backdrop-blur-sm",
          )}
        >
          <nav
            aria-label="Primary"
            className="container-page flex h-16 items-center gap-2"
          >
            <Logo />

            <div className="ml-8 hidden items-center gap-1 lg:flex">
              {PRIMARY_NAV.filter((item) => item.label !== "Collections").map(
                (item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative rounded-full px-3 py-2 text-[13px] transition-colors",
                      isActive(item.href)
                        ? "text-content"
                        : "text-muted hover:text-content",
                    )}
                  >
                    {item.label}
                    {isActive(item.href) ? (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-x-3 -bottom-0.5 h-px bg-gradient-to-r from-transparent via-accent to-transparent"
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      />
                    ) : null}
                  </Link>
                ),
              )}

              <div
                className="relative"
                onMouseEnter={() => setCollectionsOpen(true)}
                onMouseLeave={() => setCollectionsOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setCollectionsOpen((value) => !value)}
                  aria-expanded={collectionsOpen}
                  aria-haspopup="true"
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-3 py-2 text-[13px] transition-colors",
                    isActive("/collections")
                      ? "text-content"
                      : "text-muted hover:text-content",
                  )}
                >
                  Collections
                  <ChevronDown
                    className={cn(
                      "size-3 transition-transform duration-200",
                      collectionsOpen && "rotate-180",
                    )}
                  />
                </button>

                <AnimatePresence>
                  {collectionsOpen ? (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute left-1/2 top-full w-[420px] -translate-x-1/2 pt-3"
                    >
                      <div className="overflow-hidden rounded-xl border border-line bg-card p-2 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.95)]">
                        <div className="grid grid-cols-2 gap-0.5">
                          {categories.map((category) => (
                            <Link
                              key={category.slug}
                              href={`/shop?category=${category.slug}`}
                              className="group rounded-lg px-3 py-2.5 transition-colors hover:bg-white/[0.04]"
                            >
                              <span className="block text-[13px] text-content">
                                {category.name}
                              </span>
                              <span className="mt-0.5 block text-[11px] text-subtle transition-colors group-hover:text-muted">
                                Explore collection
                              </span>
                            </Link>
                          ))}
                        </div>
                        <div className="mt-1 border-t border-line-soft pt-1">
                          <Link
                            href="/collections"
                            className="flex items-center justify-between rounded-lg px-3 py-2.5 text-[11px] uppercase tracking-[0.14em] text-accent transition-colors hover:bg-accent/[0.06]"
                          >
                            View all collections
                            <span aria-hidden>→</span>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Search products"
                className="grid size-10 place-items-center rounded-full text-muted transition-colors hover:bg-white/[0.06] hover:text-content"
              >
                <Search className="size-[18px]" strokeWidth={1.6} />
              </button>

              <Link
                href={user ? "/account/wishlist" : "/login?next=/account/wishlist"}
                aria-label="Wishlist"
                className="relative hidden size-10 place-items-center rounded-full text-muted transition-colors hover:bg-white/[0.06] hover:text-content sm:grid"
              >
                <Heart className="size-[18px]" strokeWidth={1.6} />
                {wishlistCount > 0 ? (
                  <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-accent" />
                ) : null}
              </Link>

              <UserMenu user={user} />

              <button
                type="button"
                onClick={openCart}
                aria-label={`Open bag${count ? `, ${count} items` : ""}`}
                className="relative grid size-10 place-items-center rounded-full text-muted transition-colors hover:bg-white/[0.06] hover:text-content"
              >
                <ShoppingBag className="size-[18px]" strokeWidth={1.6} />
                <AnimatePresence>
                  {isHydrated && count > 0 ? (
                    <motion.span
                      key={count}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute -right-0.5 -top-0.5 grid min-w-[18px] place-items-center rounded-full bg-accent px-1 text-[9px] font-bold leading-[18px] text-[#0a0a10]"
                    >
                      {count > 9 ? "9+" : count}
                    </motion.span>
                  ) : null}
                </AnimatePresence>
              </button>

              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
                className="ml-0.5 grid size-10 place-items-center rounded-full text-muted transition-colors hover:bg-white/[0.06] hover:text-content lg:hidden"
              >
                <Menu className="size-5" strokeWidth={1.6} />
              </button>
            </div>
          </nav>
        </div>

        <AnimatePresence>
          {count > 0 && scrolled ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-x-0 top-full hidden lg:block"
            >
              <p className="container-page pt-1 text-right text-[10px] text-subtle">
                Bag · {count} {count === 1 ? "item" : "items"} ·{" "}
                {formatPrice(subtotal)}
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>

      <SearchDialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        categories={categories}
      />

      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        side="left"
        title="Menu"
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-line-soft px-5 py-5">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-full border border-accent/30 bg-accent/10 text-xs font-semibold text-accent-bright">
                  {initials(user.fullName)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-content">
                    {user.fullName}
                  </p>
                  <p className="truncate text-[11px] text-subtle">{user.email}</p>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-content">Welcome to VELORA</p>
                <p className="mt-1 text-xs text-muted">
                  Sign in to track orders and save pieces.
                </p>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="mt-3 inline-flex text-[13px] font-medium text-accent"
                >
                  Sign in or create account →
                </Link>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-4">
            <nav aria-label="Mobile" className="space-y-0.5">
              {PRIMARY_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-3 text-[15px] transition-colors",
                    isActive(item.href)
                      ? "bg-white/[0.04] text-content"
                      : "text-muted hover:bg-white/[0.03] hover:text-content",
                  )}
                >
                  {item.label}
                  <span aria-hidden className="text-subtle">→</span>
                </Link>
              ))}
            </nav>

            <p className="eyebrow px-3 pb-2 pt-6">Collections</p>
            <div className="space-y-0.5">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/shop?category=${category.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-[13px] text-muted transition-colors hover:bg-white/[0.03] hover:text-content"
                >
                  {category.name}
                </Link>
              ))}
            </div>

            {user ? (
              <>
                <p className="eyebrow px-3 pb-2 pt-6">Your account</p>
                <div className="space-y-0.5">
                  {[
                    { href: "/account", label: "Overview", icon: User },
                    { href: "/account/orders", label: "Orders", icon: Package },
                    { href: "/account/wishlist", label: "Wishlist", icon: Heart },
                    ...(user.role === "ADMIN"
                      ? [
                          {
                            href: "/admin",
                            label: "Studio dashboard",
                            icon: LayoutDashboard,
                          },
                        ]
                      : []),
                  ].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] text-muted transition-colors hover:bg-white/[0.03] hover:text-content"
                    >
                      <link.icon className="size-3.5" strokeWidth={1.7} />
                      {link.label}
                    </Link>
                  ))}
                </div>
              </>
            ) : null}
          </div>

          <div className="border-t border-line-soft p-3">
            {user ? (
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] text-muted transition-colors hover:bg-negative/[0.08] hover:text-negative"
                >
                  <LogOut className="size-3.5" strokeWidth={1.7} />
                  Sign out
                </button>
              </form>
            ) : (
              <Link
                href="/shop"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center rounded-full bg-accent px-4 py-3 text-[13px] font-medium text-[#0a0a10]"
              >
                Shop the collection
              </Link>
            )}
            <p className="px-3 pt-3 text-[10px] uppercase tracking-[0.16em] text-subtle">
              {SITE.location}
            </p>
          </div>
        </div>
      </Drawer>
    </>
  );
}
