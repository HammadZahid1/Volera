import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ProductGrid } from "@/components/product/product-grid";
import { Reveal } from "@/components/motion/reveal";
import { EmptyState } from "@/components/ui/section";
import { buttonVariants } from "@/components/ui/button";
import { getNewArrivalCount, getNewArrivals } from "@/lib/products";

export const metadata: Metadata = {
  title: "New arrivals",
  description:
    "The latest additions to the VELORA collection — small runs from our workshops, added as they arrive rather than on a seasonal calendar.",
  alternates: { canonical: "/new-arrivals" },
};

export default async function NewArrivalsPage() {
  const [products, count] = await Promise.all([
    getNewArrivals(24),
    getNewArrivalCount(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Just landed"
        title="New, without the noise."
        description="Small runs, added as they arrive from the workshop. No seasonal drop calendar, no artificial scarcity — just the newest pieces to earn a place in the collection."
        breadcrumb={[{ label: "New arrivals" }]}
      >
        <div className="flex items-center gap-2 text-[12px] text-subtle">
          <Sparkles className="size-3.5 text-accent" aria-hidden />
          {count} new {count === 1 ? "piece" : "pieces"} this season
        </div>
      </PageHeader>

      <div className="container-page py-12 lg:py-16">
        {products.length > 0 ? (
          <>
            <Reveal>
              <p className="text-[12px] text-subtle">
                Sorted by most recent arrival. Free shipping over $150.
              </p>
            </Reveal>
            <div className="mt-6">
              <ProductGrid products={products} priorityCount={4} />
            </div>
            <div className="mt-14 rounded-2xl border border-line-soft bg-card/50 p-6 text-center sm:p-8">
              <p className="display text-xl italic text-content">
                Looking for something specific?
              </p>
              <p className="mx-auto mt-2 max-w-md text-[13px] text-muted">
                The full catalog is small by design, but it spans every
                collection. Browse the complete edit.
              </p>
              <Link
                href="/shop"
                className={buttonVariants({ variant: "secondary", size: "md", className: "mt-5" })}
              >
                Browse all pieces
              </Link>
            </div>
          </>
        ) : (
          <EmptyState
            icon={Sparkles}
            title="Nothing new just yet"
            description="The next small run is on its way from the workshop. In the meantime, explore the full collection."
            action={
              <Link href="/shop" className={buttonVariants({ variant: "secondary" })}>
                Browse the catalog
              </Link>
            }
          />
        )}
      </div>
    </>
  );
}
