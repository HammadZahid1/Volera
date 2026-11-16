import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { z } from "zod";
import {
  ArrowRight,
  Check,
  CreditCard,
  Home,
  Mail,
  MapPin,
  Package,
  Truck,
} from "lucide-react";
import { OrderItemsList, OrderTotals } from "@/components/order/order-summary";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/lib/auth";
import { RECENT_ORDERS_COOKIE } from "@/lib/constants";
import { db } from "@/lib/db";
import { deliveryWindowLabel } from "@/lib/orders";
import { formatDate } from "@/lib/utils";

type Params = { orderNumber: string };

export const metadata: Metadata = {
  title: "Order confirmation",
  robots: { index: false, follow: false },
};

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { orderNumber } = await params;
  const user = await getCurrentUser();
  const order = await db.order.findUnique({
    where: { orderNumber },
    include: { items: { orderBy: { id: "asc" } } },
  });

  if (!order) notFound();

  let allowed = user?.id === order.userId || user?.role === "ADMIN";
  if (!allowed) {
    const raw = (await cookies()).get(RECENT_ORDERS_COOKIE)?.value;
    if (raw) {
      try {
        const parsed = z.array(z.string()).safeParse(JSON.parse(raw));
        allowed = parsed.success && parsed.data.includes(orderNumber);
      } catch {
        allowed = false;
      }
    }
  }

  if (!allowed) notFound();

  const firstName = order.customerName.split(" ")[0] || order.customerName;
  const delivery = deliveryWindowLabel();

  return (
    <div className="container-page py-12 lg:py-16">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-full border border-positive/30 bg-positive/10 text-positive">
          <Check className="size-6" strokeWidth={2.2} aria-hidden />
        </div>
        <p className="eyebrow mt-6">Order confirmed</p>
        <h1 className="display mt-3 text-[clamp(2.2rem,5vw,3.5rem)] leading-[1.02] text-content">
          Thank you, {firstName}.
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted">
          Your demo order has been recorded and stock has been reserved. A
          confirmation would normally be sent to{" "}
          <span className="text-content">{order.email}</span> — email delivery is
          disabled in this build.
        </p>
      </div>

      <div className="mx-auto mt-8 flex max-w-lg flex-wrap items-center justify-center gap-3 rounded-2xl border border-line-soft bg-card/60 px-5 py-4">
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.16em] text-subtle">Order number</p>
          <p className="mt-1 font-mono text-sm font-medium tracking-wide text-content">
            {order.orderNumber}
          </p>
        </div>
        <span aria-hidden className="hidden h-8 w-px bg-line sm:block" />
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.16em] text-subtle">Placed</p>
          <p className="mt-1 text-sm text-content">{formatDate(order.createdAt)}</p>
        </div>
        <span aria-hidden className="hidden h-8 w-px bg-line sm:block" />
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.16em] text-subtle">Status</p>
          <Badge variant="positive" className="mt-1">
            Confirmed
          </Badge>
        </div>
      </div>

      <div className="mx-auto mt-10 grid max-w-5xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border border-line bg-card/60 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[15px] font-medium tracking-tight text-content">
              What&apos;s coming
            </h2>
            <span className="text-[11px] text-subtle">
              {order.items.reduce((sum, item) => sum + item.quantity, 0)}{" "}
              {order.items.reduce((sum, item) => sum + item.quantity, 0) === 1
                ? "piece"
                : "pieces"}
            </span>
          </div>
          <div className="mt-3">
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
            className="mt-4 border-t border-line-soft pt-4"
          />
        </section>

        <div className="space-y-4">
          <section className="rounded-2xl border border-line bg-card/60 p-5">
            <h2 className="flex items-center gap-2 text-[13px] font-medium text-content">
              <Truck className="size-4 text-accent" aria-hidden />
              Delivery
            </h2>
            <p className="mt-3 text-[12.5px] leading-relaxed text-muted">
              Estimated arrival{" "}
              <span className="font-medium text-content">{delivery}</span>.
              Tracking would be emailed once the parcel leaves the studio.
            </p>
          </section>

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
              <p className="flex items-center gap-1.5 pt-1">
                <Mail className="size-3" aria-hidden />
                {order.email}
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
              Demo payment
            </h2>
            <p className="mt-2 text-[12px] leading-relaxed text-muted">
              No payment was collected. This order is recorded with payment
              status{" "}
              <span className="font-medium text-content">not charged</span> and
              exists only in the demo database.
            </p>
          </section>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-5xl flex-col items-center justify-center gap-3 border-t border-line-soft pt-8 sm:flex-row">
        <Link href="/shop" className={buttonVariants({ size: "md" })}>
          Continue shopping
          <ArrowRight className="size-4" aria-hidden />
        </Link>
        {user ? (
          <Link
            href="/account/orders"
            className={buttonVariants({ variant: "secondary", size: "md" })}
          >
            <Package className="size-4" aria-hidden />
            View order history
          </Link>
        ) : (
          <Link
            href="/register"
            className={buttonVariants({ variant: "secondary", size: "md" })}
          >
            <Home className="size-4" aria-hidden />
            Create an account to track orders
          </Link>
        )}
      </div>
    </div>
  );
}
