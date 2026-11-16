"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Lock, RotateCcw, ShieldCheck, ShoppingBag, Trash2, Truck } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { QuantityStepper } from "@/components/cart/quantity-stepper";
import { EmptyState } from "@/components/ui/section";
import { buttonVariants } from "@/components/ui/button";
import { SHIPPING } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

export function CartView() {
  const { items, count, subtotal, setQuantity, removeItem, isPending, isHydrated } =
    useCart();

  if (!isHydrated) {
    return (
      <div className="container-page py-12">
        <div className="skeleton h-8 w-40" />
        <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-3">
            {[0, 1, 2].map((index) => (
              <div key={index} className="skeleton h-32 rounded-2xl" />
            ))}
          </div>
          <div className="skeleton h-72 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-14 lg:py-20">
        <EmptyState
          icon={ShoppingBag}
          title="Your bag is empty"
          description="Pieces you add will be kept here. Start with the season's quiet essentials or revisit your saved pieces."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/shop" className={buttonVariants({ size: "md" })}>
                Explore the collection
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href="/account/wishlist"
                className={buttonVariants({ variant: "secondary", size: "md" })}
              >
                View wishlist
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  const shipping = subtotal >= SHIPPING.freeThreshold ? 0 : SHIPPING.flatRate;
  const total = subtotal + shipping;
  const remaining = Math.max(0, SHIPPING.freeThreshold - subtotal);

  return (
    <div className="container-page py-10 lg:py-14">
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)] lg:gap-14">
        <div>
          <div className="flex items-baseline justify-between gap-4 border-b border-line-soft pb-4">
            <p className="text-[13px] text-muted">
              {count} {count === 1 ? "piece" : "pieces"} in your bag
            </p>
            <Link
              href="/shop"
              className="text-[12px] text-subtle transition-colors hover:text-content"
            >
              Continue shopping
            </Link>
          </div>

          <ul className="divide-y divide-line-soft">
            {items.map((line) => (
              <li key={line.productId} className="flex gap-4 py-5 sm:gap-6">
                <Link
                  href={`/product/${line.slug}`}
                  className="relative block h-28 w-[88px] shrink-0 overflow-hidden rounded-xl border border-line-soft bg-canvas-soft sm:h-36 sm:w-28"
                >
                  {line.image ? (
                    <Image
                      src={line.image}
                      alt={line.imageAlt}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  ) : null}
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/product/${line.slug}`}
                        className="text-[14px] font-medium text-content transition-colors hover:text-accent-bright"
                      >
                        {line.name}
                      </Link>
                      <p className="mt-1 text-[11.5px] text-subtle">
                        {line.isAvailable
                          ? line.stock <= 5
                            ? `Only ${line.stock} left`
                            : "In stock"
                          : "Sold out — remove to continue"}
                      </p>
                      <p className="mt-1 text-[12px] text-muted sm:hidden">
                        {formatPrice(line.price)} each
                      </p>
                    </div>
                    <p className="hidden text-[14px] font-medium tabular-nums text-content sm:block">
                      {formatPrice(line.price * line.quantity)}
                    </p>
                  </div>

                  <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                    <div className="flex items-center gap-2">
                      <QuantityStepper
                        value={line.quantity}
                        onChange={(next) => setQuantity(line.productId, next)}
                        max={Math.min(line.stock, 10)}
                        disabled={!line.isAvailable}
                        loading={isPending}
                        size="sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(line.productId)}
                        aria-label={`Remove ${line.name}`}
                        className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] text-subtle transition-colors hover:bg-negative/10 hover:text-negative"
                      >
                        <Trash2 className="size-3.5" aria-hidden />
                        Remove
                      </button>
                    </div>
                    <p className="text-[14px] font-medium tabular-nums text-content sm:hidden">
                      {formatPrice(line.price * line.quantity)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex items-start gap-3 rounded-xl border border-line-soft bg-white/[0.02] p-4">
            <Truck className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
            <p className="text-[12px] leading-relaxed text-muted">
              {remaining > 0 ? (
                <>
                  Add{" "}
                  <span className="font-medium text-content">{formatPrice(remaining)}</span>{" "}
                  more for complimentary shipping. Flat {formatPrice(SHIPPING.flatRate)}{" "}
                  shipping applies below {formatPrice(SHIPPING.freeThreshold)}.
                </>
              ) : (
                <>Complimentary shipping is included with this order.</>
              )}
            </p>
          </div>
        </div>

        <aside className="lg:sticky lg:top-28">
          <div className="rounded-2xl border border-line bg-card/70 p-5 sm:p-6">
            <h2 className="text-[15px] font-medium tracking-tight text-content">
              Order summary
            </h2>
            <dl className="mt-5 space-y-3 text-[13px]">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">Subtotal</dt>
                <dd className="tabular-nums text-content">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">Shipping</dt>
                <dd className="tabular-nums text-content">
                  {shipping === 0 ? (
                    <span className="text-positive">Free</span>
                  ) : (
                    formatPrice(shipping)
                  )}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-line-soft pt-3 text-[15px]">
                <dt className="font-medium text-content">Total</dt>
                <dd className="font-medium tabular-nums text-content">
                  {formatPrice(total)}
                </dd>
              </div>
            </dl>

            <Link
              href="/checkout"
              className={buttonVariants({ size: "lg", className: "mt-5 w-full" })}
            >
              Checkout
              <ArrowRight className="size-4" aria-hidden />
            </Link>

            <p className="mt-3 flex items-center justify-center gap-1.5 text-[10.5px] text-subtle">
              <Lock className="size-3" aria-hidden />
              Demo checkout — no payment is taken
            </p>

            <ul className="mt-5 space-y-2.5 border-t border-line-soft pt-5">
              {[
                { icon: Truck, text: "Tracked delivery from our studio" },
                { icon: RotateCcw, text: "30-day returns, prepaid label" },
                { icon: ShieldCheck, text: "Two-year warranty on every piece" },
              ].map((item) => (
                <li key={item.text} className="flex items-center gap-2.5 text-[11.5px] text-subtle">
                  <item.icon className="size-3.5 text-line" aria-hidden />
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
