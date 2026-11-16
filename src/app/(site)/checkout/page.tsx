import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your VELORA order. Demo checkout — no payment is taken.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const user = await getCurrentUser();

  return (
    <>
      <PageHeader
        eyebrow="Demo checkout"
        title="Where should it go?"
        description="Prices and stock are checked again on the server before your order is recorded. No card details are requested and no payment is taken."
        breadcrumb={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]}
        className="border-b-0 pb-0"
      />
      <CheckoutForm
        defaults={{
          fullName: user?.fullName ?? "",
          email: user?.email ?? "",
          phone: user?.phone ?? "",
        }}
      />
    </>
  );
}
