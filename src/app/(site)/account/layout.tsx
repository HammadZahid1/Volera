import Link from "next/link";
import { LogOut } from "lucide-react";
import { AccountNav } from "@/components/account/account-nav";
import { requireUser } from "@/lib/auth";
import { logoutAction } from "@/server/actions/auth";
import { initials } from "@/lib/utils";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser("/account");

  return (
    <div className="container-page py-10 lg:py-14">
      <div className="grid items-start gap-8 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-12">
        <aside className="lg:sticky lg:top-28">
          <div className="rounded-2xl border border-line bg-card/60 p-4">
            <div className="flex items-center gap-3 border-b border-line-soft pb-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-full border border-accent/30 bg-accent/10 text-[12px] font-semibold text-accent-bright">
                {initials(user.fullName)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-content">
                  {user.fullName}
                </p>
                <p className="truncate text-[11px] text-subtle">{user.email}</p>
              </div>
            </div>

            <div className="mt-3">
              <AccountNav isAdmin={user.role === "ADMIN"} />
            </div>

            <div className="mt-3 border-t border-line-soft pt-3">
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] text-muted transition-colors hover:bg-negative/[0.08] hover:text-negative"
                >
                  <LogOut className="size-4" strokeWidth={1.7} aria-hidden />
                  Sign out
                </button>
              </form>
            </div>
          </div>

          <p className="mt-4 px-2 text-[10.5px] leading-relaxed text-subtle">
            Need a hand with an order?{" "}
            <Link
              href="/about#contact"
              className="text-muted underline-offset-4 hover:text-content hover:underline"
            >
              Contact the studio
            </Link>
            .
          </p>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
