import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CircleDollarSign,
  Package,
  Plus,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import { AdminStat } from "@/components/admin/stat-card";
import { OrderStatusBadge, isSampleOrder } from "@/components/order/status-badge";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate, formatPrice, cn } from "@/lib/utils";
import { getProductStats } from "@/lib/products";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Overview",
  robots: { index: false, follow: false },
};

const DAY = 24 * 60 * 60 * 1000;

export default async function AdminOverviewPage() {
  await requireAdmin("/admin");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const windowStart = new Date(today.getTime() - 13 * DAY);

  const [
    revenue,
    productStats,
    customerCount,
    recentOrders,
    lowStock,
    topItems,
    windowOrders,
    pendingCount,
  ] = await Promise.all([
    db.order.aggregate({
      where: { orderStatus: { not: "cancelled" } },
      _sum: { total: true },
      _count: { _all: true },
    }),
    getProductStats(),
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        _count: { select: { items: true } },
      },
    }),
    db.product.findMany({
      where: { isActive: true, stock: { lte: 5 } },
      orderBy: [{ stock: "asc" }, { name: "asc" }],
      take: 5,
      include: { images: { orderBy: { position: "asc" }, take: 1 } },
    }),
    db.orderItem.groupBy({
      by: ["productName", "productSlug"],
      where: { order: { orderStatus: { not: "cancelled" } } },
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    db.order.findMany({
      where: {
        createdAt: { gte: windowStart },
        orderStatus: { not: "cancelled" },
      },
      select: { createdAt: true, total: true },
    }),
    db.order.count({
      where: { orderStatus: { in: ["pending", "confirmed", "processing"] } },
    }),
  ]);

  const buckets = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(windowStart.getTime() + index * DAY);
    return {
      date,
      label: new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      }).format(date),
      total: 0,
      orders: 0,
    };
  });

  for (const order of windowOrders) {
    const index = Math.floor(
      (order.createdAt.getTime() - windowStart.getTime()) / DAY,
    );
    if (index >= 0 && index < buckets.length) {
      buckets[index].total += order.total;
      buckets[index].orders += 1;
    }
  }

  const peak = Math.max(...buckets.map((bucket) => bucket.total), 1);
  const gross = revenue._sum.total ?? 0;
  const orderCount = revenue._count._all;
  const averageOrder = orderCount > 0 ? Math.round(gross / orderCount) : 0;
  const topUnits = Math.max(
    ...topItems.map((item) => item._sum.quantity ?? 0),
    1,
  );

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div className="max-w-xl">
          <p className="eyebrow">Studio</p>
          <h1 className="display mt-2 text-[clamp(1.9rem,4vw,2.7rem)] leading-[1.05] text-content">
            Store overview.
          </h1>
          <p className="mt-2.5 text-sm leading-relaxed text-muted">
            Live figures from the catalogue, orders and customer accounts in
            this demo database.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className={buttonVariants({ size: "sm" })}
        >
          <Plus className="size-4" aria-hidden />
          New product
        </Link>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStat
          icon={CircleDollarSign}
          label="Gross order value"
          value={formatPrice(gross)}
          hint="Non-cancelled orders · demo data"
          accent
        />
        <AdminStat
          icon={ShoppingCart}
          label="Orders"
          value={orderCount}
          hint={`${pendingCount} awaiting fulfilment`}
        />
        <AdminStat
          icon={Users}
          label="Customers"
          value={customerCount}
          hint="Registered customer accounts"
        />
        <AdminStat
          icon={Package}
          label="Active products"
          value={`${productStats.activeCount}/${productStats.total}`}
          hint={`${productStats.outOfStock} out of stock · ${productStats.lowStock} low`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.45fr_1fr]">
        <section className="rounded-2xl border border-line bg-card/55 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-[14px] font-medium tracking-tight text-content">
                Revenue, last 14 days
              </h2>
              <p className="mt-1 text-[11px] text-subtle">
                {formatPrice(buckets.reduce((sum, b) => sum + b.total, 0))} across{" "}
                {buckets.reduce((sum, b) => sum + b.orders, 0)} orders
              </p>
            </div>
            <Badge variant="outline">
              <TrendingUp className="size-3" aria-hidden />
              Avg {formatPrice(averageOrder)}
            </Badge>
          </div>

          <div className="mt-6 flex h-36 items-end gap-1.5" role="img" aria-label="Revenue by day for the last 14 days">
            {buckets.map((bucket) => {
              const height = Math.max(
                bucket.total > 0 ? 8 : 2,
                Math.round((bucket.total / peak) * 100),
              );
              return (
                <div
                  key={bucket.date.toISOString()}
                  className="group relative flex h-full flex-1 flex-col justify-end"
                  title={`${bucket.label}: ${formatPrice(bucket.total)} · ${bucket.orders} orders`}
                >
                  <div
                    className={cn(
                      "w-full rounded-t-[3px] transition-colors",
                      bucket.total > 0
                        ? "bg-accent/45 group-hover:bg-accent/70"
                        : "bg-white/[0.06]",
                    )}
                    style={{ height: `${height}%` }}
                  />
                </div>
              );
            })}
          </div>

          <div className="mt-2 flex justify-between text-[10px] tabular-nums text-subtle">
            <span>{buckets[0].label}</span>
            <span>{buckets[6].label}</span>
            <span>{buckets[13].label}</span>
          </div>

          <p className="mt-3 border-t border-line-soft pt-3 text-[10.5px] leading-relaxed text-subtle">
            Includes seeded sample orders. Figures reflect the demo database,
            not live commerce.
          </p>
        </section>

        <section className="rounded-2xl border border-line bg-card/55 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[14px] font-medium tracking-tight text-content">
              Needs attention
            </h2>
            <Link
              href="/admin/products"
              className="text-[11px] text-muted transition-colors hover:text-content"
            >
              All products
            </Link>
          </div>

          {lowStock.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-line/80 bg-white/[0.015] px-3 py-6 text-center text-[11.5px] leading-relaxed text-subtle">
              Every active piece has healthy stock.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-line-soft">
              {lowStock.map((product) => (
                <li key={product.id} className="flex items-center gap-3 py-2.5">
                  <span className="relative size-9 shrink-0 overflow-hidden rounded-lg border border-line-soft bg-surface">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0].url}
                        alt={product.images[0].alt}
                        fill
                        sizes="36px"
                        className="object-cover"
                      />
                    ) : null}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="block truncate text-[12px] font-medium text-content transition-colors hover:text-accent-bright"
                    >
                      {product.name}
                    </Link>
                    <p className="text-[10.5px] text-subtle">
                      {product.stock === 0
                        ? "Out of stock"
                        : `${product.stock} remaining`}
                    </p>
                  </div>
                  <Badge
                    variant={product.stock === 0 ? "danger" : "warning"}
                  >
                    {product.stock === 0 ? "Sold out" : "Low"}
                  </Badge>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-accent/20 bg-accent/[0.05] px-3 py-2.5">
            <p className="text-[11px] leading-relaxed text-muted">
              {pendingCount === 0
                ? "No orders awaiting fulfilment."
                : `${pendingCount} ${pendingCount === 1 ? "order" : "orders"} awaiting fulfilment.`}
            </p>
            <Link
              href="/admin/orders"
              className="shrink-0 text-[11px] font-medium text-accent-bright hover:underline"
            >
              Review
            </Link>
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.45fr_1fr]">
        <section className="overflow-hidden rounded-2xl border border-line bg-card/55">
          <div className="flex items-center justify-between gap-3 p-5 pb-3">
            <h2 className="text-[14px] font-medium tracking-tight text-content">
              Recent orders
            </h2>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 text-[11px] text-muted transition-colors hover:text-content"
            >
              View all
              <ArrowRight className="size-3" aria-hidden />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px] border-collapse text-left">
              <thead>
                <tr className="border-y border-line-soft text-[10px] uppercase tracking-[0.14em] text-subtle">
                  <th className="px-5 py-2.5 font-medium">Order</th>
                  <th className="px-3 py-2.5 font-medium">Customer</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                  <th className="px-5 py-2.5 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="text-[12px]">
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-mono text-[11.5px] font-medium text-content transition-colors hover:text-accent-bright"
                      >
                        {order.orderNumber}
                      </Link>
                      <p className="mt-1 flex items-center gap-1.5 text-[10.5px] text-subtle">
                        {formatDate(order.createdAt)}
                        {isSampleOrder(order) ? (
                          <span className="text-warning/80">· sample</span>
                        ) : null}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="max-w-[12rem] truncate text-content">
                        {order.customerName}
                      </p>
                      <p className="max-w-[12rem] truncate text-[10.5px] text-subtle">
                        {order.email}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <OrderStatusBadge status={order.orderStatus} />
                    </td>
                    <td className="px-5 py-3 text-right font-medium tabular-nums text-content">
                      {formatPrice(order.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-card/55 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[14px] font-medium tracking-tight text-content">
              Best sellers
            </h2>
            <Badge variant="outline">By units</Badge>
          </div>

          {topItems.length === 0 ? (
            <p className="mt-4 text-[11.5px] leading-relaxed text-subtle">
              No sales recorded yet.
            </p>
          ) : (
            <ul className="mt-4 space-y-3.5">
              {topItems.map((item) => {
                const units = item._sum.quantity ?? 0;
                return (
                  <li key={item.productSlug}>
                    <div className="flex items-baseline justify-between gap-3 text-[12px]">
                      <Link
                        href={`/product/${item.productSlug}`}
                        className="min-w-0 truncate text-content transition-colors hover:text-accent-bright"
                      >
                        {item.productName}
                      </Link>
                      <span className="shrink-0 tabular-nums text-subtle">
                        {units} sold
                      </span>
                    </div>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-accent/50"
                        style={{ width: `${Math.max(6, (units / topUnits) * 100)}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <Link
            href="/admin/products/new"
            className="mt-5 inline-flex items-center gap-1.5 text-[11px] font-medium text-accent-bright hover:underline"
          >
            Add a new piece
            <ArrowUpRight className="size-3" aria-hidden />
          </Link>
        </section>
      </div>

      <p className="text-[10.5px] leading-relaxed text-subtle">
        Statuses:{" "}
        {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).join(" · ")}. New
        orders from checkout start as{" "}
        {ORDER_STATUS_LABELS["confirmed" as OrderStatus].toLowerCase()}.
      </p>
    </div>
  );
}
