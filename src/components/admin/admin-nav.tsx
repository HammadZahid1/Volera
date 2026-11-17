"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Studio administration" className="space-y-1">
      {links.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] transition-colors",
              active
                ? "bg-white/[0.06] font-medium text-content"
                : "text-muted hover:bg-white/[0.03] hover:text-content",
            )}
          >
            <link.icon
              className={cn("size-4", active ? "text-accent" : "text-subtle")}
              strokeWidth={1.7}
              aria-hidden
            />
            {link.label}
          </Link>
        );
      })}

      <div className="!mt-4 border-t border-line-soft pt-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] text-muted transition-colors hover:bg-white/[0.03] hover:text-content"
        >
          <ArrowUpRight className="size-4 text-subtle" strokeWidth={1.7} aria-hidden />
          View storefront
        </Link>
      </div>
    </nav>
  );
}
