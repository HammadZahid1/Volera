import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Heart,
  Mail,
  Package,
  Phone,
  ShoppingBag,
} from "lucide-react";
import { OrderStatusBadge, isSampleOrder } from "@/components/order/status-badge";
import { AdminStat } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/section";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { cn, formatDate, formatPrice, initials } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Customer detail",
  robots: { index: false, follow: false },
};

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireAdmin(`/admin/customers/${id}`);

  const customer = await db.user.findUnique({
    where: { id },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { items: true } } },
      },
      wishlist: {
        orderBy: { createdAt: "desc" },
        include: {
          product: {
            select: {
              name: true,
              slug: true,
              price: true,
              isActive: true,
              images: { orderBy: { position: "asc" }, take: 1 },
            },
          },
        },
      },
    },
  });

  if (!customer) notFound();

  const activeOrders = customer.orders.filter(
    (order) => order.orderStatus !== "cancelled",
  );
  const lifetime = activeOrders.reduce((sum, order) => sum + order.total, 0);
  const lastOrder = customer.orders[0];

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-1.5 text-[12px] text-muted transition-colors hover:text-content"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          All customers
        </Link>

        <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <span className="grid size-12 shrink-0 place-items-center rounded-full border border-accent/30 bg-accent/10 text-[13px] font-semibold text-accent-bright">
              {initials(customer.fullName)}
            </span>
            <div>
              <p className="eyebrow">Customer</p>
              <h1 className="display mt-1 text-[clamp(1.7rem,3.4vw,2.3rem)] leading-[1.05] text-content">
                {customer.fullName}
              </h1>
              <p className="mt-1.5 text-[12px] text-subtle">
                {customer.email} · joined {formatDate(customer.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={customer.role === "ADMIN" ? "accent" : "outline"}>
              {customer.role === "ADMIN" ? "Administrator" : "Customer"}
            </Badge>
            <a
              href={`mailto:${customer.email}`}
              className={buttonVariants({ variant: "secondary", size: "sm" })}
            >
              <Mail className="size-3.5" aria-hidden />
              Email
            </a>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <AdminStat
          icon={ShoppingBag}
          label="Orders"
          value={customer.orders.length}
          hint={`${activeOrders.length} non-cancelled`}
        />
        <AdminStat
          icon={Package}
          label="Lifetime value"
          value={formatPrice(lifetime)}
          hint="Non-cancelled demo orders"
          accent
        />
        <AdminStat
          icon={Heart}
          label="Wishlist"
          value={customer.wishlist.length}
          hint="Saved pieces"
        />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <section className="overflow-hidden rounded-2xl border border-line bg-card/55">
          <div className="flex items-center justify-between gap-3 p-5 pb-3">
            <h2 className="text-[14px] font-medium tracking-tight text-content">
              Order history
            </h2>
            {lastOrder ? (
              <span className="text-[10.5px] text-subtle">
                Last order {formatDate(lastOrder.createdAt)}
              </span>
            ) : null}
          </div>

          {customer.orders.length === 0 ? (
            <div className="p-5 pt-0">
              <EmptyState
                icon={ShoppingBag}
                title="No orders yet"
                description="This customer has not placed an order with the studio."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left">
                <thead>
                  <tr className="border-y border-line-soft text-[10px] uppercase tracking-[0.14em] text-subtle">
                    <th className="px-5 py-2.5 font-medium">Order</th>
                    <th className="px-3 py-2.5 font-medium">Placed</th>
                    <th className="px-3 py-2.5 font-medium">Items</th>
                    <th className="px-3 py-2.5 font-medium">Status</th>
                    <th className="px-5 py-2.5 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-soft">
                  {customer.orders.map((order) => (
                    <tr key={order.id} className="text-[12px]">
                      <td className="px-5 py-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-mono text-[11.5px] font-medium text-content transition-colors hover:text-accent-bright"
                        >
                          {order.orderNumber}
                        </Link>
                        {isSampleOrder(order) ? (
                          <p className="mt-0.5 text-[10px] text-warning/80">
                            sample
                          </p>
                        ) : null}
                      </td>
                      <td className="px-3 py-3 text-muted">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-3 py-3 tabular-nums text-muted">
                        {order._count.items}
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
          )}
        </section>

        <div className="space-y-4">
          <section className="rounded-2xl border border-line bg-card/55 p-5">
            <h2 className="text-[13px] font-medium text-content">
              Contact & account
            </h2>
            <dl className="mt-3 space-y-2.5 text-[11.5px]">
              <div className="flex items-start justify-between gap-3">
                <dt className="inline-flex items-center gap-1.5 text-subtle">
                  <Mail className="size-3.5" aria-hidden />
                  Email
                </dt>
                <dd className="max-w-[11rem] break-all text-right text-content">
                  {customer.email}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="inline-flex items-center gap-1.5 text-subtle">
                  <Phone className="size-3.5" aria-hidden />
                  Phone
                </dt>
                <dd className="text-right text-content">
                  {customer.phone ?? "Not provided"}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="inline-flex items-center gap-1.5 text-subtle">
                  <CalendarDays className="size-3.5" aria-hidden />
                  Joined
                </dt>
                <dd className="text-right text-content">
                  {formatDate(customer.createdAt)}
                </dd>
              </div>
            </dl>
            <Link
              href={`/admin/orders?q=${encodeURIComponent(customer.email)}`}
              className={cn(
                buttonVariants({ variant: "secondary", size: "sm" }),
                "mt-4",
              )}
            >
              Search their orders
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </section>

          <section className="rounded-2xl border border-line bg-card/40 p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[13px] font-medium text-content">Wishlist</h2>
              <span className="text-[10.5px] tabular-nums text-subtle">
                {customer.wishlist.length}
              </span>
            </div>

            {customer.wishlist.length === 0 ? (
              <p className="mt-3 text-[11.5px] leading-relaxed text-subtle">
                No saved pieces yet.
              </p>
            ) : (
              <ul className="mt-3 space-y-2.5">
                {customer.wishlist.slice(0, 5).map((item) => (
                  <li key={item.id} className="flex items-center gap-2.5">
                    <span className="relative size-9 shrink-0 overflow-hidden rounded-lg border border-line-soft bg-surface">
                      {item.product.images[0] ? (
                        <Image
                          src={item.product.images[0].url}
                          alt={item.product.images[0].alt}
                          fill
                          sizes="36px"
                          className="object-cover"
                        />
                      ) : null}
                    </span>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/product/${item.product.slug}`}
                        className="block truncate text-[11.5px] text-content transition-colors hover:text-accent-bright"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-[10px] text-subtle">
                        {formatPrice(item.product.price)}
                        {!item.product.isActive ? " · archived" : ""}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <p className="rounded-2xl border border-line-soft bg-canvas-soft/50 p-4 text-[10.5px] leading-relaxed text-subtle">
            Account data and order history come from the demo database. Guest
            orders placed with the same email are not linked automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
