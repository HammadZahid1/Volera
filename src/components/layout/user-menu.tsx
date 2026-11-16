"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Package,
  User,
  Heart,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { logoutAction } from "@/server/actions/auth";
import { initials } from "@/lib/utils";

export type NavUser = {
  fullName: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
};

export function UserMenu({ user }: { user: NavUser | null }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  if (!user) {
    return (
      <Link
        href="/login"
        aria-label="Sign in"
        className="grid size-10 place-items-center rounded-full text-muted transition-colors hover:bg-white/[0.06] hover:text-content"
      >
        <User className="size-[18px]" strokeWidth={1.6} />
      </Link>
    );
  }

  const links = [
    { href: "/account", label: "Account overview", icon: User },
    { href: "/account/orders", label: "Orders", icon: Package },
    { href: "/account/wishlist", label: "Wishlist", icon: Heart },
    ...(user.role === "ADMIN"
      ? [{ href: "/admin", label: "Studio dashboard", icon: LayoutDashboard }]
      : []),
  ];

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex h-10 items-center gap-2 rounded-full px-1.5 text-muted transition-colors hover:bg-white/[0.06] hover:text-content"
      >
        <span className="grid size-7 place-items-center rounded-full border border-accent/30 bg-accent/10 text-[10px] font-semibold text-accent-bright">
          {initials(user.fullName)}
        </span>
        <ChevronDown
          className={`hidden size-3 transition-transform duration-200 sm:block ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.99 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-xl border border-line bg-card shadow-[0_24px_70px_-20px_rgba(0,0,0,0.9)]"
          >
            <div className="border-b border-line-soft px-4 py-3.5">
              <p className="truncate text-sm font-medium text-content">
                {user.fullName}
              </p>
              <p className="truncate text-[11px] text-subtle">{user.email}</p>
            </div>
            <div className="p-1.5">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-muted transition-colors hover:bg-white/[0.05] hover:text-content"
                >
                  <link.icon className="size-3.5" strokeWidth={1.7} />
                  {link.label}
                </Link>
              ))}
            </div>
            <form action={logoutAction} className="border-t border-line-soft p-1.5">
              <button
                type="submit"
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-muted transition-colors hover:bg-negative/[0.08] hover:text-negative"
              >
                <LogOut className="size-3.5" strokeWidth={1.7} />
                Sign out
              </button>
            </form>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
