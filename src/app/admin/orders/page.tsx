import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { ShoppingCart } from "lucide-react";
import { AdminPagination } from "@/components/admin/pagination";
import { OrderStatusBadge, isSampleOrder } from "@/components/order/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/section";
import { requireAdmin } from "@/lib/auth";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from "@/lib/constants";
import { db } from "@/lib/db";
import { cn, formatDate, formatPrice } from "@/lib/utils";
import type { RawSearchParams } from "@/lib/catalog-params";

export const metadata: Metadata = {
  title: "Orders",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 15;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  await requireAdmin("/admin/orders");
  const raw = await searchParams;

  const q = (first(raw.q) ?? "").trim().slice(0, 80);
  const rawStatus = first(raw.status) ?? "all";
  const status = ORDER_STATUSES.includes(rawStatus as OrderStatus)
    ? (rawStatus as OrderStatus)
    : "all";
  const requestedPage = Number(first(raw.page));
  const page = Number.isFinite(requestedPage)
    ? Math.max(1, Math.min(Math.round(requestedPage), 500))
    : 1;

  const where: Prisma.OrderWhereInput = {};
  if (q) {
    where.OR = [
      { orderNumber: { contains: q } },
      { customerName: { contains: q } },
      { email: { contains: q } },
    ];
  }
  if (status !== "all") where.orderStatus = status;

  const [total, statusGroups] = await Promise.all([
    db.order.count({ where }),
    db.order.groupBy({ by: ["orderStatus"], _count: { _all: true } }),
  ]);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);

  const orders = await db.order.findMany({
    where,
    include: { _count: { select: { items: true } } },
    orderBy: { createdAt: "desc" },
    skip: (safePage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const counts = new Map(
    statusGroups.map((group) => [group.orderStatus, group._count._all]),
  );
  const allCount = statusGroups.reduce(
    (sum, group) => sum + group._count._all,
    0,
  );

  const tabHref = (value: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (value !== "all") params.set("status", value);
    const search = params.toString();
    return search ? `/admin/orders?${search}` : "/admin/orders";
  };

  const query: Record<string, string> = {};
  if (q) query.q = q;
  if (status !== "all") query.status = status;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Fulfilment</p>
          <h1 className="display mt-2 text-[clamp(1.8rem,3.6vw,2.5rem)] leading-[1.05] text-content">
            Orders.
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            {allCount} orders in the demo database. Move each one through its
            lifecycle.
          </p>
        </div>
      </header>

      <div className="flex flex-wrap gap-1.5">
        {["all", ...ORDER_STATUSES].map((value) => {
          const active = status === value;
          const count =
            value === "all" ? allCount : (counts.get(value) ?? 0);
          return (
            <Link
              key={value}
              href={tabHref(value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] transition-colors",
                active
                  ? "border-accent/35 bg-accent/10 text-accent-bright"
                  : "border-line text-muted hover:border-line hover:text-content",
              )}
            >
              {value === "all"
                ? "All"
                : ORDER_STATUS_LABELS[value as OrderStatus]}
              <span className="tabular-nums opacity-70">{count}</span>
            </Link>
          );
        })}
      </div>

      <form
        method="get"
        className="flex flex-wrap items-end gap-2.5 rounded-2xl border border-line bg-card/40 p-4"
      >
        {status !== "all" ? (
          <input type="hidden" name="status" value={status} />
        ) : null}
        <div className="min-w-[200px] flex-1">
          <label
            htmlFor="order-search"
            className="mb-2 block text-[11px] font-medium uppercase tracking-[0.14em] text-muted"
          >
            Search orders
          </label>
          <Input
            id="order-search"
            name="q"
            defaultValue={q}
            placeholder="Order number, customer or email"
          />
        </div>
        <button
          type="submit"
          className={buttonVariants({ variant: "secondary", size: "md" })}
        >
          Search
        </button>
        {q ? (
          <Link
            href={status === "all" ? "/admin/orders" : `/admin/orders?status=${status}`}
            className={buttonVariants({ variant: "ghost", size: "md" })}
          >
            Clear
          </Link>
        ) : null}
      </form>

      {orders.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="No orders match"
          description="Try another status or search term. New checkouts will appear here automatically."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-card/55">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line-soft text-[10px] uppercase tracking-[0.14em] text-subtle">
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-3 py-3 font-medium">Customer</th>
                  <th className="px-3 py-3 font-medium">Placed</th>
                  <th className="px-3 py-3 font-medium">Items</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {orders.map((order) => (
                  <tr key={order.id} className="text-[12px]">
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-mono text-[11.5px] font-medium text-content transition-colors hover:text-accent-bright"
                      >
                        {order.orderNumber}
                      </Link>
                      <p className="mt-0.5 text-[10.5px] text-subtle">
                        {order.paymentStatus === "not_charged"
                          ? "Demo · not charged"
                          : `Demo · ${order.paymentStatus}`}
                      </p>
                    </td>
                    <td className="px-3 py-3.5">
                      <p className="max-w-[12rem] truncate text-content">
                        {order.customerName}
                      </p>
                      <p className="max-w-[12rem] truncate text-[10.5px] text-subtle">
                        {order.email}
                      </p>
                    </td>
                    <td className="px-3 py-3.5 text-muted">
                      {formatDate(order.createdAt)}
                      {isSampleOrder(order) ? (
                        <span className="ml-1.5 text-[10px] text-warning/80">
                          sample
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-3.5 tabular-nums text-muted">
                      {order._count.items}
                    </td>
                    <td className="px-3 py-3.5">
                      <OrderStatusBadge status={order.orderStatus} />
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium tabular-nums text-content">
                      {formatPrice(order.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AdminPagination
        page={safePage}
        pageCount={pageCount}
        basePath="/admin/orders"
        query={query}
      />
    </div>
  );
}
