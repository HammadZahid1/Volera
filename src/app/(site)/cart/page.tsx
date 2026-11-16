import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = {
  title: "Your bag",
  description: "Review the pieces in your VELORA bag before checkout.",
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return (
    <>
      <PageHeader
        eyebrow="Almost yours"
        title="Your bag."
        description="Review quantities and shipping before continuing. Guest bags are saved on this device; signed-in bags follow your account."
        breadcrumb={[{ label: "Cart" }]}
        className="border-b-0 pb-0"
      />
      <CartView />
    </>
  );
}
