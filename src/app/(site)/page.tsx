import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BrandStory } from "@/components/home/brand-story";
import { CollectionsShowcase } from "@/components/home/collections-showcase";
import { EditorialPromo } from "@/components/home/editorial-promo";
import { Hero } from "@/components/home/hero";
import { NewsletterPanel } from "@/components/home/newsletter-panel";
import { Testimonials } from "@/components/home/testimonials";
import { ValuesStrip } from "@/components/home/values-strip";
import { ProductGrid } from "@/components/product/product-grid";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section";
import {
  getCategories,
  getCategoryProductCounts,
  getFeaturedProducts,
  getNewArrivals,
} from "@/lib/products";

export const metadata: Metadata = {
  title: "Premium essentials for modern living",
  description:
    "VELORA is a tightly curated collection of audio, timepieces, leather goods and objects for the considered home. Free shipping over $150.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [featured, newArrivals, categories, counts] = await Promise.all([
    getFeaturedProducts(8),
    getNewArrivals(4),
    getCategories(),
    getCategoryProductCounts(),
  ]);

  const categoryCards = categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    imageUrl: category.imageUrl,
    count: counts.get(category.id) ?? 0,
  }));
  const totalProducts = categoryCards.reduce((sum, category) => sum + category.count, 0);

  return (
    <>
      <Hero />
      <ValuesStrip />
      <CollectionsShowcase categories={categoryCards} totalProducts={totalProducts} />

      <section className="container-page pb-20 lg:pb-24">
        <Reveal>
          <SectionHeading
            eyebrow="The short list"
            title="Pieces we reach for first"
            description="The most-kept objects in the collection, chosen by the studio for everyday use."
            action={
              <Link
                href="/shop?sort=featured"
                className="inline-flex items-center gap-2 text-[13px] font-medium text-content transition-colors hover:text-accent-bright"
              >
                Shop all products
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            }
          />
        </Reveal>
        <div className="mt-10">
          <ProductGrid products={featured} priorityCount={2} />
        </div>
      </section>

      <EditorialPromo />

      <section className="container-page py-20 lg:py-24">
        <Reveal>
          <SectionHeading
            eyebrow="Just landed"
            title="New to the collection"
            description="Small runs, added as they arrive from the workshop — not on a seasonal calendar."
            action={
              <Link
                href="/new-arrivals"
                className="inline-flex items-center gap-2 text-[13px] font-medium text-content transition-colors hover:text-accent-bright"
              >
                All new arrivals
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            }
          />
        </Reveal>
        <div className="mt-10">
          <ProductGrid products={newArrivals} columns={3} />
        </div>
      </section>

      <BrandStory />
      <Testimonials />
      <NewsletterPanel />
    </>
  );
}
