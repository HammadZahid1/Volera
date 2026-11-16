"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Lock, ShieldCheck, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import { FieldError, Input, Label, Textarea } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/section";
import { placeOrderAction } from "@/server/actions/checkout";
import { SHIPPING } from "@/lib/constants";
import { checkoutFormSchema, type CheckoutFormValues } from "@/lib/validation";
import { formatPrice } from "@/lib/utils";

export function CheckoutForm({
  defaults,
}: {
  defaults: { fullName: string; email: string; phone: string };
}) {
  const router = useRouter();
  const { items, subtotal, count, clear, isHydrated } = useCart();
  const idempotencyKey = useRef<string | null>(null);

  useEffect(() => {
    idempotencyKey.current = crypto.randomUUID();
  }, []);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      fullName: defaults.fullName,
      email: defaults.email,
      phone: defaults.phone,
      address: "",
      city: "",
      postalCode: "",
      deliveryInstructions: "",
    },
  });

  const shipping = subtotal >= SHIPPING.freeThreshold ? 0 : SHIPPING.flatRate;
  const total = subtotal + shipping;

  if (!isHydrated) {
    return (
      <div className="container-page py-12">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <div className="skeleton h-10 w-48" />
            <div className="skeleton h-80 rounded-2xl" />
          </div>
          <div className="skeleton h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-14 lg:py-20">
        <EmptyState
          icon={ShoppingBag}
          title="Nothing to check out yet"
          description="Your bag is empty. Add a piece or two, then come back to complete the order."
          action={
            <Link href="/shop" className={buttonVariants({ size: "md" })}>
              Explore the collection
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          }
        />
      </div>
    );
  }

  const onSubmit = handleSubmit(async (values) => {
    if (!idempotencyKey.current) idempotencyKey.current = crypto.randomUUID();

    const result = await placeOrderAction({
      ...values,
      items: items.map((line) => ({
        productId: line.productId,
        quantity: line.quantity,
      })),
      idempotencyKey: idempotencyKey.current,
    });

    if (!result.ok || !result.orderNumber) {
      toast.error(result.message ?? "We couldn't place the order.");
      for (const [field, messages] of Object.entries(result.fieldErrors ?? {})) {
        if (field === "_form") continue;
        if (field === "items" || field === "idempotencyKey") continue;
        setError(field as keyof CheckoutFormValues, { message: messages[0] });
      }
      return;
    }

    toast.success("Order placed — thank you.");
    void clear();
    router.push(`/order/${result.orderNumber}`);
  });

  return (
    <div className="container-page py-10 lg:py-14">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-[12px] text-muted transition-colors hover:text-content"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Back to bag
        </Link>
        <div className="flex items-center gap-2 text-[11px] text-subtle">
          <Lock className="size-3" aria-hidden />
          Secure demo checkout · No payment details required
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        noValidate
        className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:gap-14"
      >
        <div className="space-y-9">
          {Object.keys(errors).length > 0 ? (
            <div
              role="alert"
              className="rounded-xl border border-negative/25 bg-negative/[0.07] px-4 py-3 text-sm text-negative"
            >
              Please review the highlighted fields.
            </div>
          ) : null}

          <section>
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-[15px] font-medium tracking-tight text-content">
                1. Contact
              </h2>
              <span className="text-[11px] text-subtle">For order updates</span>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="checkout-email">Email address</Label>
                <Input
                  id="checkout-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  invalid={Boolean(errors.email)}
                  {...register("email")}
                />
                <FieldError message={errors.email?.message} />
              </div>
              <div>
                <Label htmlFor="checkout-phone">Phone</Label>
                <Input
                  id="checkout-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+45 12 34 56 78"
                  invalid={Boolean(errors.phone)}
                  {...register("phone")}
                />
                <FieldError message={errors.phone?.message} />
              </div>
              <div>
                <Label htmlFor="checkout-name">Full name</Label>
                <Input
                  id="checkout-name"
                  autoComplete="name"
                  placeholder="First and last name"
                  invalid={Boolean(errors.fullName)}
                  {...register("fullName")}
                />
                <FieldError message={errors.fullName?.message} />
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-[15px] font-medium tracking-tight text-content">
                2. Shipping address
              </h2>
              <span className="text-[11px] text-subtle">Tracked delivery</span>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="checkout-address">Street address</Label>
                <Input
                  id="checkout-address"
                  autoComplete="street-address"
                  placeholder="Street, building, apartment"
                  invalid={Boolean(errors.address)}
                  {...register("address")}
                />
                <FieldError message={errors.address?.message} />
              </div>
              <div>
                <Label htmlFor="checkout-city">City</Label>
                <Input
                  id="checkout-city"
                  autoComplete="address-level2"
                  placeholder="City"
                  invalid={Boolean(errors.city)}
                  {...register("city")}
                />
                <FieldError message={errors.city?.message} />
              </div>
              <div>
                <Label htmlFor="checkout-postal">Postal code</Label>
                <Input
                  id="checkout-postal"
                  autoComplete="postal-code"
                  placeholder="Postal code"
                  invalid={Boolean(errors.postalCode)}
                  {...register("postalCode")}
                />
                <FieldError message={errors.postalCode?.message} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="checkout-instructions" optional>
                  Delivery instructions
                </Label>
                <Textarea
                  id="checkout-instructions"
                  placeholder="Gate code, safe place, or anything the courier should know."
                  rows={3}
                  invalid={Boolean(errors.deliveryInstructions)}
                  {...register("deliveryInstructions")}
                />
                <FieldError message={errors.deliveryInstructions?.message} />
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-[15px] font-medium tracking-tight text-content">
                3. Payment
              </h2>
              <span className="text-[11px] text-subtle">Demo only</span>
            </div>
            <div className="mt-5 rounded-2xl border border-dashed border-accent/30 bg-accent/[0.04] p-5">
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full border border-accent/30 bg-accent/10 text-accent-bright">
                  <ShieldCheck className="size-4" aria-hidden />
                </span>
                <div>
                  <p className="text-[13px] font-medium text-content">
                    Demo checkout — no card required
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted">
                    This storefront is a portfolio demo. Placing the order
                    validates stock and records an unpaid demo order; no card
                    details are requested, stored or charged.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-3 border-t border-line-soft pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] leading-relaxed text-subtle">
              By placing this order you agree to the{" "}
              <Link href="/terms" className="text-muted underline-offset-4 hover:underline">
                demo terms
              </Link>
              . No money will be taken.
            </p>
            <Button type="submit" size="lg" loading={isSubmitting} className="shrink-0">
              {isSubmitting ? "Placing order" : `Place demo order · ${formatPrice(total)}`}
            </Button>
          </div>
        </div>

        <aside className="lg:sticky lg:top-28">
          <div className="rounded-2xl border border-line bg-card/70 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[15px] font-medium tracking-tight text-content">
                Your order
              </h2>
              <Link
                href="/cart"
                className="text-[11px] text-subtle underline-offset-4 hover:text-content hover:underline"
              >
                Edit bag
              </Link>
            </div>

            <ul className="mt-4 space-y-3">
              {items.map((line) => (
                <li key={line.productId} className="flex items-center gap-3">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-line-soft bg-canvas-soft">
                    {line.image ? (
                      <Image
                        src={line.image}
                        alt={line.imageAlt}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : null}
                    <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full border border-line bg-raised text-[10px] font-medium tabular-nums text-content">
                      {line.quantity}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-medium text-content">
                      {line.name}
                    </p>
                    <p className="text-[11px] text-subtle">
                      {formatPrice(line.price)} each
                    </p>
                  </div>
                  <p className="text-[12.5px] font-medium tabular-nums text-content">
                    {formatPrice(line.price * line.quantity)}
                  </p>
                </li>
              ))}
            </ul>

            <dl className="mt-5 space-y-2.5 border-t border-line-soft pt-4 text-[13px]">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">
                  Subtotal · {count} {count === 1 ? "piece" : "pieces"}
                </dt>
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

            <p className="mt-4 flex items-start gap-2 text-[10.5px] leading-relaxed text-subtle">
              <Lock className="mt-0.5 size-3 shrink-0" aria-hidden />
              Prices and stock are re-validated on the server before the order
              is recorded.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}
