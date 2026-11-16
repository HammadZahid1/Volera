import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Check,
  CreditCard,
  Mail,
  MapPin,
  Package,
  Phone,
  Truck,
  XCircle,
} from "lucide-react";
import {
  OrderItemsList,
  OrderTotals,
} from "@/components/order/order-summary";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
  PaymentStatusNote,
  SampleOrderBadge,
  isSampleOrder,
} from "@/components/order/status-badge";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from "@/lib/constants";
import { db } from "@/lib/db";
import { deliveryWindowLabel } from "@/lib/orders";
import { cn, formatDateTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Order details",
  robots: { index: false, follow: false },
};

const TIMELINE_STEPS = ORDER_STATUSES.filter(
  (status) => status !== "cancelled",
);

export default async function AccountOrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const user = await requireUser(`/account/orders/${orderNumber}`);

  const order = await db.order.findFirst({
    where: { orderNumber, userId: user.id },
    include: { items: { orderBy: { id: "asc" } } },
  });

  if (!order) notFound();

  const sample = isSampleOrder(order);
  const cancelled = order.orderStatus === "cancelled";
  const currentIndex = TIMELINE_STEPS.indexOf(
    order.orderStatus as (typeof TIMELINE_STEPS)[number],
  );
  const moving = !cancelled && order.orderStatus !== "delivered";
  const pieceCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-7">
      <div>
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-1.5 text-[12px] text-muted transition-colors hover:text-content"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          All orders
        </Link>

        <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Order details</p>
            <h1 className="mt-2 font-mono text-[clamp(1.45rem,3.6vw,2rem)] font-medium tracking-tight text-content">
              {order.orderNumber}
            </h1>
            <p className="mt-2 text-[12px] text-subtle">
              Placed {formatDateTime(order.createdAt)} · {pieceCount}{" "}
              {pieceCount === 1 ? "piece" : "pieces"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {sample ? <SampleOrderBadge /> : null}
            <OrderStatusBadge status={order.orderStatus} />
          </div>
        </div>
      </div>

      {cancelled ? (
        <div className="flex items-start gap-3 rounded-2xl border border-negative/25 bg-negative/[0.06] px-4 py-3.5">
          <XCircle
            className="mt-0.5 size-4 shrink-0 text-negative"
            strokeWidth={1.8}
            aria-hidden
          />
          <div>
            <p className="text-[13px] font-medium text-content">
              This order was cancelled
            </p>
            <p className="mt-1 text-[11.5px] leading-relaxed text-muted">
              No further action is needed.{" "}
              {sample
                ? "This sample row is illustrative demo data."
                : "If you have questions, contact the studio below."}
            </p>
          </div>
        </div>
      ) : null}

      {sample ? (
        <p className="rounded-xl border border-line-soft bg-canvas-soft/60 px-4 py-3 text-[11.5px] leading-relaxed text-subtle">
          This entry is seeded demo data — it shows how order history and status
          tracking work, but it is not a real purchase.
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-4">
          <section className="rounded-2xl border border-line bg-card/60 p-5">
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

          <section className="rounded-2xl border border-line bg-card/60 p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[14px] font-medium tracking-tight text-content">
                Progress
              </h2>
              {moving && !sample ? (
                <Badge variant="outline">In motion</Badge>
              ) : null}
            </div>

            {cancelled ? (
              <p className="mt-3 text-[12.5px] leading-relaxed text-muted">
                The order stopped before dispatch. Its history is kept for your
                records.
              </p>
            ) : (
              <ol className="mt-4">
                {TIMELINE_STEPS.map((step: OrderStatus, index) => {
                  const done = currentIndex >= 0 && index <= currentIndex;
                  const current = index === currentIndex;
                  return (
                    <li key={step} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span
                          className={cn(
                            "grid size-6 shrink-0 place-items-center rounded-full border text-[10px] tabular-nums transition-colors",
                            done
                              ? "border-accent/40 bg-accent/15 text-accent-bright"
                              : "border-line bg-canvas-soft text-subtle",
                          )}
                        >
                          {done ? (
                            <Check className="size-3" strokeWidth={2.4} aria-hidden />
                          ) : (
                            index + 1
                          )}
                        </span>
                        {index < TIMELINE_STEPS.length - 1 ? (
                          <span
                            aria-hidden
                            className={cn(
                              "my-1 w-px flex-1",
                              done ? "bg-accent/30" : "bg-line-soft",
                            )}
                          />
                        ) : null}
                      </div>
                      <div
                        className={cn(
                          "pb-4",
                          index === TIMELINE_STEPS.length - 1 && "pb-0",
                        )}
                      >
                        <p
                          className={cn(
                            "text-[12.5px]",
                            current
                              ? "font-medium text-content"
                              : done
                                ? "text-content/90"
                                : "text-subtle",
                          )}
                        >
                          {ORDER_STATUS_LABELS[step]}
                        </p>
                        {current ? (
                          <p className="mt-0.5 text-[11px] text-subtle">
                            Current status
                          </p>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}

            {moving && !sample ? (
              <p className="mt-4 border-t border-line-soft pt-3 text-[11.5px] leading-relaxed text-muted">
                Estimated arrival{" "}
                <span className="font-medium text-content">
                  {deliveryWindowLabel(order.createdAt)}
                </span>
                . Tracking would be emailed when the parcel leaves the studio.
              </p>
            ) : null}
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-2xl border border-line bg-card/60 p-5">
            <h2 className="flex items-center gap-2 text-[13px] font-medium text-content">
              <MapPin className="size-4 text-accent" aria-hidden />
              Shipping to
            </h2>
            <address className="mt-3 space-y-0.5 text-[12.5px] not-italic leading-relaxed text-muted">
              <p className="font-medium text-content">{order.customerName}</p>
              <p>{order.shippingAddress}</p>
              <p>
                {order.city} {order.postalCode}
              </p>
              <p className="flex items-center gap-1.5 pt-1.5">
                <Mail className="size-3 shrink-0" aria-hidden />
                {order.email}
              </p>
              <p className="flex items-center gap-1.5">
                <Phone className="size-3 shrink-0" aria-hidden />
                {order.phone}
              </p>
            </address>
            {order.deliveryInstructions ? (
              <p className="mt-3 rounded-lg border border-line-soft bg-canvas-soft/50 p-2.5 text-[11.5px] leading-relaxed text-subtle">
                “{order.deliveryInstructions}”
              </p>
            ) : null}
          </section>

          <section className="rounded-2xl border border-dashed border-accent/30 bg-accent/[0.04] p-5">
            <h2 className="flex items-center gap-2 text-[13px] font-medium text-content">
              <CreditCard className="size-4 text-accent" aria-hidden />
              Payment
            </h2>
            <div className="mt-3">
              <PaymentStatusBadge status={order.paymentStatus} />
            </div>
            <p className="mt-3 text-[11.5px] leading-relaxed text-muted">
              <PaymentStatusNote status={order.paymentStatus} />
            </p>
          </section>

          <section className="rounded-2xl border border-line bg-card/40 p-5">
            <h2 className="flex items-center gap-2 text-[13px] font-medium text-content">
              <Truck className="size-4 text-accent" aria-hidden />
              Need help?
            </h2>
            <p className="mt-2 text-[11.5px] leading-relaxed text-muted">
              Questions about this order? Contact the studio and include your
              order number.
            </p>
            <Link
              href="/about#contact"
              className={cn(
                buttonVariants({ variant: "secondary", size: "sm" }),
                "mt-3",
              )}
            >
              Contact support
            </Link>
          </section>

          <Link
            href="/account/orders"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "w-full justify-start text-[12px]",
            )}
          >
            <Package className="size-4" aria-hidden />
            Back to all orders
          </Link>
        </div>
      </div>
    </div>
  );
}
