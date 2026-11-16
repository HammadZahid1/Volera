import { Badge, type BadgeProps } from "@/components/ui/badge";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/constants";
import { cn } from "@/lib/utils";

type BadgeVariant = NonNullable<BadgeProps["variant"]>;

const STATUS_VARIANTS: Record<OrderStatus, BadgeVariant> = {
  pending: "warning",
  confirmed: "accent",
  processing: "accent",
  shipped: "accent",
  delivered: "positive",
  cancelled: "danger",
};

export function orderStatusLabel(status: string) {
  return ORDER_STATUS_LABELS[status as OrderStatus] ?? "Unknown";
}

export function OrderStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <Badge
      variant={STATUS_VARIANTS[status as OrderStatus] ?? "neutral"}
      className={className}
    >
      {orderStatusLabel(status)}
    </Badge>
  );
}

/**
 * Seeded sample rows carry no idempotency key. Real checkouts always do, so
 * this lets the account UI distinguish illustrative history from purchases.
 */
export function isSampleOrder(order: { idempotencyKey: string | null }) {
  return order.idempotencyKey === null;
}

export function SampleOrderBadge({ className }: { className?: string }) {
  return (
    <Badge variant="outline" className={cn("normal-case tracking-normal", className)}>
      Sample data
    </Badge>
  );
}

const PAYMENT_COPY: Record<string, { label: string; variant: BadgeVariant }> = {
  not_charged: { label: "Not charged", variant: "neutral" },
  paid: { label: "Demo · marked paid", variant: "warning" },
  refunded: { label: "Demo · refunded", variant: "neutral" },
};

export function PaymentStatusBadge({ status }: { status: string }) {
  const entry = PAYMENT_COPY[status] ?? {
    label: "Demo payment",
    variant: "neutral" as BadgeVariant,
  };
  return <Badge variant={entry.variant}>{entry.label}</Badge>;
}

export function PaymentStatusNote({ status }: { status: string }) {
  if (status === "not_charged") {
    return (
      <>
        No payment was collected. This build records orders with payment status{" "}
        <span className="font-medium text-content">not charged</span>.
      </>
    );
  }

  return (
    <>
      This row is seeded demo data. The recorded payment status is{" "}
      <span className="font-medium text-content">{status}</span> and no real
      transaction exists.
    </>
  );
}
