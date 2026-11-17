import type { Metadata } from "next";
import Link from "next/link";
import { AdminNav } from "@/components/admin/admin-nav";
import { Logo } from "@/components/ui/logo";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth";
import { logoutAction } from "@/server/actions/auth";

export const metadata: Metadata = {
  title: {
    default: "Studio admin",
    template: "%s · Studio admin",
  },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin("/admin");

  return (
    <div className="min-h-dvh">
      <a
        href="#admin-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[#0a0a10]"
      >
        Skip to admin content
      </a>

      <header className="border-b border-line-soft">
        <div className="container-page flex flex-wrap items-center justify-between gap-4 py-5">
          <div className="flex items-center gap-3">
            <Logo href="/admin" />
            <Badge variant="accent">Studio admin</Badge>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] text-subtle">
            <span className="hidden sm:inline">
              {user.fullName} · {user.email}
            </span>
            <Link
              href="/"
              className="transition-colors hover:text-content"
            >
              Storefront
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="transition-colors hover:text-negative"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="container-page py-7 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-10">
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <AdminNav />
          </aside>
          <div id="admin-content" className="min-w-0">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
