import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  CreditCard,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { OrderItemsList, OrderTotals } from "@/components/order/order-summary";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
  PaymentStatusNote,
  SampleOrderBadge,
  isSampleOrder,
} from "@/components/order/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { cn, formatDateTime, formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Order detail",
  robots: { index: false, follow: false },
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireAdmin(`/admin/orders/${id}`);

  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: { orderBy: { id: "asc" } },
      user: { select: { id: true, fullName: true, email: true, role: true } },
    },
  });

  if (!order) notFound();

  const sample = isSampleOrder(order);
  const pieceCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-[12px] text-muted transition-colors hover:text-content"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          All orders
        </Link>

        <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Order</p>
            <h1 className="mt-2 font-mono text-[clamp(1.4rem,3.4vw,1.9rem)] font-medium tracking-tight text-content">
              {order.orderNumber}
            </h1>
            <p className="mt-2 text-[11.5px] text-subtle">
              Placed {formatDateTime(order.createdAt)} · {pieceCount}{" "}
              {pieceCount === 1 ? "piece" : "pieces"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {sample ? <SampleOrderBadge /> : null}
            <OrderStatusBadge status={order.orderStatus} />
            <Link
              href={`/order/${order.orderNumber}`}
              className={buttonVariants({ variant: "secondary", size: "sm" })}
            >
              Customer receipt
              <ArrowUpRight className="size-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-line bg-card/55 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-[14px] font-medium tracking-tight text-content">
              Fulfilment status
            </h2>
            <p className="mt-1 max-w-lg text-[11.5px] leading-relaxed text-muted">
              Cancelling returns reserved stock to the catalogue. Reopening a
              cancelled order reserves it again, or refuses if stock has since
              sold out.
            </p>
          </div>
          <OrderStatusForm orderId={order.id} status={order.orderStatus} />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-4">
          <section className="rounded-2xl border border-line bg-card/55 p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[14px] font-medium tracking-tight text-content">
                Items
              </h2>
              <span className="text-[11px] text-subtle">
                {pieceCount} {pieceCount === 1 ? "piece" : "pieces"}
              </span>
            </div>
            <div className="mt-2">
              <OrderItemsList
                items={order.items.map((item) => ({
                  id: item.id,
                  productName: item.productName,
                  productSlug: item.productSlug,
                  productImage: item.productImage,
                  unitPrice: item.unitPrice,
                  quantity: item.quantity,
                  subtotal: item.subtotal,
                }))}
              />
            </div>
            <OrderTotals
              subtotal={order.subtotal}
              shippingCost={order.shippingCost}
              total={order.total}
              className="mt-2 border-t border-line-soft pt-4"
            />
          </section>

          <section className="rounded-2xl border border-line bg-card/55 p-5">
            <h2 className="flex items-center gap-2 text-[13px] font-medium text-content">
              <MapPin className="size-4 text-accent" aria-hidden />
              Delivery address
            </h2>
            <address className="mt-3 space-y-0.5 text-[12.5px] not-italic leading-relaxed text-muted">
              <p className="font-medium text-content">{order.customerName}</p>
              <p>{order.shippingAddress}</p>
              <p>
                {order.city} {order.postalCode}
              </p>
            </address>
            {order.deliveryInstructions ? (
              <p className="mt-3 rounded-lg border border-line-soft bg-canvas-soft/50 p-2.5 text-[11.5px] leading-relaxed text-subtle">
                “{order.deliveryInstructions}”
              </p>
            ) : null}
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-2xl border border-line bg-card/55 p-5">
            <h2 className="flex items-center gap-2 text-[13px] font-medium text-content">
              <UserRound className="size-4 text-accent" aria-hidden />
              Customer
            </h2>
            <div className="mt-3 space-y-1.5 text-[12.5px] text-muted">
              <p className="font-medium text-content">{order.customerName}</p>
              <p className="flex items-center gap-1.5">
                <Mail className="size-3 shrink-0" aria-hidden />
                {order.email}
              </p>
              <p className="flex items-center gap-1.5">
                <Phone className="size-3 shrink-0" aria-hidden />
                {order.phone}
              </p>
            </div>

            {order.user ? (
              <Link
                href={`/admin/customers/${order.user.id}`}
                className={cn(
                  buttonVariants({ variant: "secondary", size: "sm" }),
                  "mt-3",
                )}
              >
                View customer account
              </Link>
            ) : (
              <p className="mt-3 rounded-lg border border-line-soft bg-canvas-soft/50 p-2.5 text-[11px] leading-relaxed text-subtle">
                Guest checkout — no account is linked to this order.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-dashed border-accent/30 bg-accent/[0.04] p-5">
            <h2 className="flex items-center gap-2 text-[13px] font-medium text-content">
              <CreditCard className="size-4 text-accent" aria-hidden />
              Payment
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <PaymentStatusBadge status={order.paymentStatus} />
              <span className="text-[10.5px] uppercase tracking-[0.12em] text-subtle">
                {order.paymentMethod}
              </span>
            </div>
            <p className="mt-3 text-[11.5px] leading-relaxed text-muted">
              <PaymentStatusNote status={order.paymentStatus} />
            </p>
          </section>

          <section className="rounded-2xl border border-line bg-card/40 p-5">
            <h2 className="text-[13px] font-medium text-content">
              Order record
            </h2>
            <dl className="mt-3 space-y-2 text-[11.5px]">
              <div className="flex justify-between gap-3">
                <dt className="text-subtle">Order ID</dt>
                <dd className="max-w-[10rem] truncate font-mono text-muted">
                  {order.id}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-subtle">Last updated</dt>
                <dd className="text-muted">{formatDateTime(order.updatedAt)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-subtle">Source</dt>
                <dd className="text-muted">
                  {sample ? "Seed data" : "Checkout"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-subtle">Total</dt>
                <dd className="text-content">{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
