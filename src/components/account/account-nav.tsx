"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, LayoutDashboard, Package, User, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/account", label: "Overview", icon: UserRound, exact: true },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/profile", label: "Profile", icon: User },
];

export function AccountNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  const items = isAdmin
    ? [...links, { href: "/admin", label: "Studio dashboard", icon: LayoutDashboard }]
    : links;

  return (
    <nav aria-label="Account" className="space-y-0.5">
      {items.map((item) => {
        const active = item.href === "/account"
          ? pathname === "/account"
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] transition-colors",
              active
                ? "bg-white/[0.06] font-medium text-content"
                : "text-muted hover:bg-white/[0.03] hover:text-content",
            )}
          >
            <item.icon
              className={cn("size-4", active ? "text-accent" : "text-subtle")}
              strokeWidth={1.7}
              aria-hidden
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
