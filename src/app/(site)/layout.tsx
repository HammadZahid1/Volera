import { CartDrawer } from "@/components/cart/cart-drawer";
import { CartProvider } from "@/components/cart/cart-provider";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { WishlistProvider } from "@/components/wishlist/wishlist-provider";
import { getCurrentUser } from "@/lib/auth";
import { getCartLines } from "@/lib/cart";
import { db } from "@/lib/db";
import { getCategories } from "@/lib/products";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const categories = await getCategories();

  const cart = user ? await getCartLines(user.id) : [];
  const wishlist = user
    ? await db.wishlistItem.findMany({
        where: { userId: user.id },
        select: { productId: true },
      })
    : [];

  const navCategories = categories.map((category) => ({
    name: category.name,
    slug: category.slug,
  }));

  return (
    <CartProvider initialCart={cart} isAuthenticated={Boolean(user)}>
      <WishlistProvider
        initialIds={wishlist.map((item) => item.productId)}
        isAuthenticated={Boolean(user)}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[#0a0a10]"
        >
          Skip to content
        </a>
        <Navbar
          user={
            user
              ? { fullName: user.fullName, email: user.email, role: user.role }
              : null
          }
          categories={navCategories}
        />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
        <CartDrawer />
      </WishlistProvider>
    </CartProvider>
  );
}
