import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

export type OrderItemView = {
  id: string;
  productName: string;
  productSlug: string;
  productImage: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
};

export function OrderItemsList({
  items,
  compact = false,
}: {
  items: OrderItemView[];
  compact?: boolean;
}) {
  return (
    <ul className={cn("divide-y divide-line-soft", compact && "divide-line-soft/70")}>
      {items.map((item) => (
        <li key={item.id} className={cn("flex items-center gap-4", compact ? "py-3" : "py-4")}>
          <Link
            href={`/product/${item.productSlug}`}
            className={cn(
              "relative shrink-0 overflow-hidden rounded-lg border border-line-soft bg-canvas-soft",
              compact ? "size-12" : "size-16",
            )}
          >
            {item.productImage ? (
              <Image
                src={item.productImage}
                alt={item.productName}
                fill
                sizes="64px"
                className="object-cover"
              />
            ) : null}
          </Link>
          <div className="min-w-0 flex-1">
            <Link
              href={`/product/${item.productSlug}`}
              className="block truncate text-[13px] font-medium text-content transition-colors hover:text-accent-bright"
            >
              {item.productName}
            </Link>
            <p className="mt-0.5 text-[11px] text-subtle">
              {item.quantity} × {formatPrice(item.unitPrice)}
            </p>
          </div>
          <p className="text-[13px] font-medium tabular-nums text-content">
            {formatPrice(item.subtotal)}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function OrderTotals({
  subtotal,
  shippingCost,
  total,
  className,
}: {
  subtotal: number;
  shippingCost: number;
  total: number;
  className?: string;
}) {
  return (
    <dl className={cn("space-y-2.5 text-[13px]", className)}>
      <div className="flex items-center justify-between gap-4">
        <dt className="text-muted">Subtotal</dt>
        <dd className="tabular-nums text-content">{formatPrice(subtotal)}</dd>
      </div>
      <div className="flex items-center justify-between gap-4">
        <dt className="text-muted">Shipping</dt>
        <dd className="tabular-nums text-content">
          {shippingCost === 0 ? (
            <span className="text-positive">Free</span>
          ) : (
            formatPrice(shippingCost)
          )}
        </dd>
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-line-soft pt-3 text-[15px]">
        <dt className="font-medium text-content">Total</dt>
        <dd className="font-medium tabular-nums text-content">{formatPrice(total)}</dd>
      </div>
    </dl>
  );
}
