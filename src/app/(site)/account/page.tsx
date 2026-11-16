import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Heart,
  Package,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  OrderStatusBadge,
  SampleOrderBadge,
  isSampleOrder,
} from "@/components/order/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate, formatPrice, initials } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Account overview",
  description: "Your VELORA orders, saved pieces and account details.",
  robots: { index: false, follow: false },
};

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-card/50 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-subtle">
          {label}
        </p>
        <Icon className="size-4 text-accent/80" strokeWidth={1.7} aria-hidden />
      </div>
      <p className="mt-2.5 text-xl font-medium tabular-nums leading-none text-content">
        {value}
      </p>
      <p className="mt-2 text-[11px] leading-relaxed text-subtle">{hint}</p>
    </div>
  );
}

export default async function AccountOverviewPage() {
  const user = await requireUser("/account");

  const [orderCount, wishlistCount, latestOrder] = await Promise.all([
    db.order.count({ where: { userId: user.id } }),
    db.wishlistItem.count({ where: { userId: user.id } }),
    db.order.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        items: { orderBy: { id: "asc" }, take: 3 },
      },
    }),
  ]);

  const firstName = user.fullName.split(" ")[0] || user.fullName;
  const sample = latestOrder ? isSampleOrder(latestOrder) : false;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div className="max-w-xl">
          <p className="eyebrow">Your account</p>
          <h1 className="display mt-2 text-[clamp(1.9rem,4vw,2.7rem)] leading-[1.05] text-content">
            Welcome back, {firstName}.
          </h1>
          <p className="mt-2.5 text-sm leading-relaxed text-muted">
            A quiet place for your orders, saved pieces and the details behind
            them.
          </p>
        </div>
        <Link
          href="/shop"
          className={buttonVariants({ variant: "secondary", size: "sm" })}
        >
          Continue shopping
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          icon={Package}
          label="Orders"
          value={orderCount}
          hint={
            orderCount === 0
              ? "Your first order will appear here."
              : "Placed with the VELORA studio."
          }
        />
        <StatCard
          icon={Heart}
          label="Saved pieces"
          value={wishlistCount}
          hint={
            wishlistCount === 0
              ? "Save pieces you are considering."
              : "Waiting in your wishlist."
          }
        />
        <StatCard
          icon={CalendarDays}
          label="Member since"
          value={formatDate(user.createdAt)}
          hint="Thank you for being part of the studio."
        />
      </div>

      <section
        aria-labelledby="recent-order-heading"
        className="rounded-2xl border border-line bg-card/60 p-5 sm:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2
            id="recent-order-heading"
            className="text-[15px] font-medium tracking-tight text-content"
          >
            Recent order
          </h2>
          {orderCount > 0 ? (
            <Link
              href="/account/orders"
              className="inline-flex items-center gap-1.5 text-[12px] text-muted transition-colors hover:text-content"
            >
              All orders
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          ) : null}
        </div>

        {latestOrder ? (
          <div className="mt-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-[12.5px] font-medium tracking-wide text-content">
                  {latestOrder.orderNumber}
                </p>
                <p className="mt-1 text-[11px] text-subtle">
                  Placed {formatDate(latestOrder.createdAt)} ·{" "}
                  {latestOrder.items.length > 0
                    ? `${latestOrder.items.length} ${
                        latestOrder.items.length === 1 ? "line" : "lines"
                      }`
                    : "No items"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {sample ? <SampleOrderBadge /> : null}
                <OrderStatusBadge status={latestOrder.orderStatus} />
              </div>
            </div>

            {latestOrder.items.length > 0 ? (
              <div className="mt-4 flex items-center gap-2">
                {latestOrder.items.map((item) => (
                  <span
                    key={item.id}
                    className="relative size-12 overflow-hidden rounded-lg border border-line-soft bg-surface"
                  >
                    {item.productImage ? (
                      <Image
                        src={item.productImage}
                        alt={item.productName}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : null}
                  </span>
                ))}
                <span className="pl-1 text-[11px] text-subtle">
                  {latestOrder.items.map((item) => item.productName).join(" · ")}
                </span>
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-line-soft pt-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-subtle">
                  Total
                </p>
                <p className="mt-1 text-[15px] font-medium tabular-nums text-content">
                  {formatPrice(latestOrder.total)}
                </p>
              </div>
              <Link
                href={`/account/orders/${latestOrder.orderNumber}`}
                className={buttonVariants({ variant: "secondary", size: "sm" })}
              >
                View order
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </div>

            {sample ? (
              <p className="mt-4 rounded-lg border border-line-soft bg-canvas-soft/60 px-3 py-2 text-[11px] leading-relaxed text-subtle">
                Sample data from the demo seed — illustrative only, not a real
                purchase.
              </p>
            ) : null}
          </div>
        ) : (
          <div className="mt-4 flex flex-col items-start gap-4 rounded-xl border border-dashed border-line/80 bg-white/[0.015] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full border border-line bg-surface text-subtle">
                <Sparkles className="size-4" strokeWidth={1.7} aria-hidden />
              </span>
              <div>
                <p className="text-[13px] font-medium text-content">
                  No orders yet
                </p>
                <p className="mt-1 text-[12px] leading-relaxed text-muted">
                  When you place an order it will appear here with its status
                  and details.
                </p>
              </div>
            </div>
            <Link
              href="/new-arrivals"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Explore new arrivals
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
        )}
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/account/wishlist"
          className="group rounded-2xl border border-line bg-card/40 p-5 transition-colors hover:border-accent/25 hover:bg-card/70"
        >
          <Heart
            className="size-5 text-accent/80 transition-transform duration-300 group-hover:scale-110"
            strokeWidth={1.6}
            aria-hidden
          />
          <p className="mt-3 text-[14px] font-medium text-content">
            Your wishlist
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-muted">
            Revisit the pieces you have saved and move them to your bag when the
            moment is right.
          </p>
          <span className="mt-3 inline-flex items-center gap-1.5 text-[12px] text-accent-bright">
            Open wishlist
            <ArrowRight className="size-3.5" aria-hidden />
          </span>
        </Link>

        <Link
          href="/account/profile"
          className="group rounded-2xl border border-line bg-card/40 p-5 transition-colors hover:border-accent/25 hover:bg-card/70"
        >
          <ShieldCheck
            className="size-5 text-accent/80 transition-transform duration-300 group-hover:scale-110"
            strokeWidth={1.6}
            aria-hidden
          />
          <p className="mt-3 text-[14px] font-medium text-content">
            Account details
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-muted">
            Keep your contact details current and update your password at any
            time.
          </p>
          <span className="mt-3 inline-flex items-center gap-1.5 text-[12px] text-accent-bright">
            Edit profile
            <ArrowRight className="size-3.5" aria-hidden />
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-line-soft bg-canvas-soft/50 p-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-full border border-accent/25 bg-accent/10 text-[11px] font-semibold text-accent-bright">
          {initials(user.fullName)}
        </span>
        <p className="text-[12px] leading-relaxed text-muted">
          Signed in as{" "}
          <span className="font-medium text-content">{user.email}</span>. This
          demo build stores account data in a local database.
        </p>
      </div>
    </div>
  );
}
