"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart/cart-provider";
import { QuantityStepper } from "@/components/cart/quantity-stepper";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/section";
import { Drawer } from "@/components/ui/overlay";
import { SHIPPING } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const {
    items,
    count,
    subtotal,
    isOpen,
    closeCart,
    setQuantity,
    removeItem,
    isPending,
  } = useCart();

  const remaining = Math.max(0, SHIPPING.freeThreshold - subtotal);
  const progress = Math.min(100, (subtotal / SHIPPING.freeThreshold) * 100);

  return (
    <Drawer open={isOpen} onClose={closeCart} title={`Your bag${count ? ` (${count})` : ""}`}>
      {items.length === 0 ? (
        <div className="p-5">
          <EmptyState
            icon={ShoppingBag}
            title="Your bag is empty"
            description="Pieces you add will appear here. Start with the season's quiet essentials."
            action={
              <Link
                href="/shop"
                onClick={closeCart}
                className={buttonVariants({ size: "md" })}
              >
                Explore the collection
                <ArrowRight className="size-4" />
              </Link>
            }
            className="border-0 bg-transparent px-0 py-10"
          />
        </div>
      ) : (
        <div className="flex min-h-full flex-col">
          <div className="border-b border-line-soft px-5 py-4">
            {remaining > 0 ? (
              <p className="text-xs text-muted">
                Add{" "}
                <span className="font-medium text-content">
                  {formatPrice(remaining)}
                </span>{" "}
                for complimentary shipping
              </p>
            ) : (
              <p className="text-xs font-medium text-positive">
                Complimentary shipping unlocked
              </p>
            )}
            <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-accent-deep to-accent"
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>

          <ul className="flex-1 divide-y divide-line-soft px-5">
            <AnimatePresence initial={false}>
              {items.map((line) => (
                <motion.li
                  key={line.productId}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="flex gap-4 py-4">
                    <Link
                      href={`/product/${line.slug}`}
                      onClick={closeCart}
                      className="relative block h-24 w-[74px] shrink-0 overflow-hidden rounded-lg border border-line-soft bg-canvas-soft"
                    >
                      {line.image ? (
                        <Image
                          src={line.image}
                          alt={line.imageAlt}
                          fill
                          sizes="74px"
                          className="object-cover"
                        />
                      ) : null}
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link
                            href={`/product/${line.slug}`}
                            onClick={closeCart}
                            className="block truncate text-[13px] font-medium text-content transition-colors hover:text-accent-bright"
                          >
                            {line.name}
                          </Link>
                          <p className="mt-0.5 text-[11px] text-subtle">
                            {line.isAvailable
                              ? line.stock <= 5
                                ? `Only ${line.stock} left`
                                : "In stock"
                              : "Sold out"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(line.productId)}
                          aria-label={`Remove ${line.name}`}
                          className="grid size-7 shrink-0 place-items-center rounded-full text-subtle transition-colors hover:bg-negative/10 hover:text-negative"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>

                      <div className="mt-auto flex items-end justify-between gap-2 pt-3">
                        <QuantityStepper
                          value={line.quantity}
                          onChange={(next) => setQuantity(line.productId, next)}
                          max={Math.min(line.stock, 10)}
                          disabled={!line.isAvailable}
                          loading={isPending}
                          size="sm"
                        />
                        <p className="text-[13px] font-medium tabular-nums text-content">
                          {formatPrice(line.price * line.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          <div className="sticky bottom-0 mt-auto border-t border-line bg-surface/95 px-5 py-5 backdrop-blur">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Subtotal</span>
              <span className="font-medium tabular-nums text-content">
                {formatPrice(subtotal)}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-subtle">
              Shipping calculated at checkout · Taxes included
            </p>
            <div className="mt-4 grid gap-2">
              <Link
                href="/checkout"
                onClick={closeCart}
                className={buttonVariants({ size: "lg" })}
              >
                Checkout
                <ArrowRight className="size-4" />
              </Link>
              <Button
                variant="ghost"
                onClick={closeCart}
                className="w-full text-[13px]"
              >
                Continue shopping
              </Button>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}
