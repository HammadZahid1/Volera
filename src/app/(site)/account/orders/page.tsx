import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Package, ShoppingBag } from "lucide-react";
import {
  OrderStatusBadge,
  SampleOrderBadge,
  isSampleOrder,
} from "@/components/order/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/section";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Order history",
  description: "Track every VELORA order and revisit its details.",
  robots: { index: false, follow: false },
};

export default async function AccountOrdersPage() {
  const user = await requireUser("/account/orders");

  const orders = await db.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: { orderBy: { id: "asc" }, take: 3 },
      _count: { select: { items: true } },
    },
  });

  const hasSamples = orders.some((order) => isSampleOrder(order));

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-xl">
          <p className="eyebrow">Purchases</p>
          <h1 className="display mt-2 text-[clamp(1.9rem,4vw,2.7rem)] leading-[1.05] text-content">
            Order history.
          </h1>
          <p className="mt-2.5 text-sm leading-relaxed text-muted">
            Every order placed with this account, newest first.
          </p>
        </div>
        <Link
          href="/shop"
          className={buttonVariants({ variant: "secondary", size: "sm" })}
        >
          Shop all pieces
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </header>

      {hasSamples ? (
        <p className="rounded-xl border border-line-soft bg-canvas-soft/60 px-4 py-3 text-[11.5px] leading-relaxed text-subtle">
          Rows marked{" "}
          <span className="font-medium text-muted">sample data</span> come from
          the demo seed and are illustrative only. They do not represent real
          purchases or payments.
        </p>
      ) : null}

      {orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders yet"
          description="When you place your first order, its confirmation and status will live here."
          action={
            <Link href="/shop" className={buttonVariants({ size: "md" })}>
              <ShoppingBag className="size-4" aria-hidden />
              Start exploring
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const sample = isSampleOrder(order);
            const lineCount = order._count.items;

            return (
              <article
                key={order.id}
                className="rounded-2xl border border-line bg-card/55 p-4 transition-colors hover:border-line sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[12.5px] font-medium tracking-wide text-content">
                      {order.orderNumber}
                    </p>
                    <p className="mt-1 text-[11px] text-subtle">
                      {formatDate(order.createdAt)} · {lineCount}{" "}
                      {lineCount === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {sample ? <SampleOrderBadge /> : null}
                    <OrderStatusBadge status={order.orderStatus} />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {order.items.map((item) => (
                    <span
                      key={item.id}
                      className="relative size-11 overflow-hidden rounded-lg border border-line-soft bg-surface"
                    >
                      {item.productImage ? (
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      ) : null}
                    </span>
                  ))}
                  {lineCount > order.items.length ? (
                    <span className="grid size-11 place-items-center rounded-lg border border-line-soft bg-canvas-soft text-[11px] tabular-nums text-subtle">
                      +{lineCount - order.items.length}
                    </span>
                  ) : null}
                  <span className="min-w-0 flex-1 truncate pl-1 text-[11.5px] text-subtle">
                    {order.items.map((item) => item.productName).join(" · ")}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-line-soft pt-3.5">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-subtle">
                      Total
                    </p>
                    <p className="mt-1 text-[14px] font-medium tabular-nums text-content">
                      {formatPrice(order.total)}
                    </p>
                  </div>
                  <Link
                    href={`/account/orders/${order.orderNumber}`}
                    className={buttonVariants({
                      variant: "secondary",
                      size: "sm",
                    })}
                  >
                    Order details
                    <ArrowRight className="size-3.5" aria-hidden />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
