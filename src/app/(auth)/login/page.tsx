import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your VELORA account to view orders and saved pieces.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "ADMIN" ? "/admin" : "/account");

  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : undefined;

  return (
    <div>
      <p className="eyebrow mb-4">Welcome back</p>
      <h1 className="text-[2rem] font-medium leading-tight tracking-[-0.03em] text-content">
        Sign in to VELORA
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Track orders, save pieces to your wishlist, and pick up where you left
        off.
      </p>

      <div className="mt-8">
        <LoginForm next={next} />
      </div>

      <div className="mt-8 rounded-xl border border-line bg-white/[0.02] px-4 py-3">
        <p className="text-[11px] uppercase tracking-[0.14em] text-subtle">
          Demo accounts
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-muted">
          Customer: <span className="text-content">customer@velora.com</span> /
          VeloraDemo!2026
          <br />
          Admin: <span className="text-content">admin@velora.com</span> /
          VeloraAdmin!2026
        </p>
      </div>
    </div>
  );
}
