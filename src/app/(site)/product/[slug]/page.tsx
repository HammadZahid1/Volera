import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  Package,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductPurchase } from "@/components/product/product-purchase";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/ui/rating";
import { Reveal } from "@/components/motion/reveal";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";
import { discountPercent, formatPrice } from "@/lib/utils";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product not found" };
  }

  const description = product.description.slice(0, 158);
  const image = product.images[0]?.url;

  return {
    title: product.name,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      type: "website",
      title: `${product.name} · VELORA`,
      description,
      url: `/product/${product.slug}`,
      images: image ? [{ url: image, alt: product.name }] : undefined,
    },
  };
}

const servicePoints = [
  { icon: Truck, title: "Complimentary delivery", copy: "On orders over $150" },
  { icon: RotateCcw, title: "30-day returns", copy: "Prepaid return label" },
  { icon: ShieldCheck, title: "2-year warranty", copy: "Serviced by our studio" },
];

export default async function ProductPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const related = await getRelatedProducts(product.id, product.categoryId, 4);
  const discount = discountPercent(product.price, product.compareAtPrice);
  const details = product.details
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const primaryImage = product.images[0];

  return (
    <div className="container-page pb-20 pt-8 lg:pb-28">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5 text-[11px] text-subtle">
          <li>
            <Link href="/" className="transition-colors hover:text-content">
              Home
            </Link>
          </li>
          <li className="flex items-center gap-1.5">
            <ChevronRight className="size-3 text-line" aria-hidden />
            <Link href="/shop" className="transition-colors hover:text-content">
              Shop
            </Link>
          </li>
          <li className="flex items-center gap-1.5">
            <ChevronRight className="size-3 text-line" aria-hidden />
            <Link
              href={`/shop?category=${product.category.slug}`}
              className="transition-colors hover:text-content"
            >
              {product.category.name}
            </Link>
          </li>
          <li className="flex items-center gap-1.5">
            <ChevronRight className="size-3 text-line" aria-hidden />
            <span className="text-muted" aria-current="page">
              {product.name}
            </span>
          </li>
        </ol>
      </nav>

      <div className="mt-7 grid gap-10 lg:grid-cols-[1.02fr_1fr] lg:gap-14 xl:gap-20">
        <ProductGallery
          images={product.images.map((image) => ({
            id: image.id,
            url: image.url,
            alt: image.alt,
          }))}
          productName={product.name}
          isNew={product.isNew}
        />

        <div className="lg:pt-2">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/shop?category=${product.category.slug}`}
              className="eyebrow transition-colors hover:text-accent-bright"
            >
              {product.category.name}
            </Link>
            <span aria-hidden className="size-1 rounded-full bg-line" />
            <span className="text-[10px] uppercase tracking-[0.14em] text-subtle">
              SKU {product.sku}
            </span>
          </div>

          <h1 className="display mt-3 text-[clamp(2.1rem,4.4vw,3.4rem)] leading-[1.03] text-content">
            {product.name}
          </h1>

          <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-2">
            <RatingStars rating={product.rating} reviewCount={product.reviewCount} size="md" />
            <a
              href="#reviews"
              className="text-[11px] text-subtle underline-offset-4 transition-colors hover:text-content hover:underline"
            >
              Read about ratings
            </a>
          </div>

          <div className="mt-5 flex flex-wrap items-end gap-3">
            <p className="text-[1.75rem] font-medium tracking-tight text-content">
              {formatPrice(product.price)}
            </p>
            {product.compareAtPrice && product.compareAtPrice > product.price ? (
              <>
                <p className="pb-1 text-sm text-subtle line-through">
                  {formatPrice(product.compareAtPrice)}
                </p>
                <Badge variant="solid" className="mb-1.5">
                  Save {discount}%
                </Badge>
              </>
            ) : null}
          </div>

          <p className="mt-5 max-w-xl text-[14px] leading-relaxed text-muted">
            {product.description}
          </p>

          <div className="mt-7 border-t border-line-soft pt-7">
            <ProductPurchase
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                compareAtPrice: product.compareAtPrice,
                stock: product.stock,
                image: {
                  url: primaryImage?.url ?? "",
                  alt: primaryImage?.alt ?? product.name,
                },
              }}
            />
            <p className="mt-4 text-[11px] text-subtle">
              Demo checkout — no real payment is processed. Taxes and shipping
              are calculated at checkout.
            </p>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {servicePoints.map((point) => (
              <div
                key={point.title}
                className="rounded-xl border border-line-soft bg-white/[0.02] p-3.5"
              >
                <point.icon className="size-4 text-accent" strokeWidth={1.5} aria-hidden />
                <p className="mt-2 text-[11.5px] font-medium text-content">{point.title}</p>
                <p className="mt-0.5 text-[10.5px] text-subtle">{point.copy}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 divide-y divide-line-soft border-y border-line-soft">
            <details className="group py-4" open>
              <summary className="flex cursor-pointer list-none items-center justify-between text-[13px] font-medium text-content [&::-webkit-details-marker]:hidden">
                Details & materials
                <span className="text-subtle transition-transform duration-300 group-open:rotate-45">
                  +
                </span>
              </summary>
              <ul className="mt-3 space-y-2">
                {details.map((line) => (
                  <li
                    key={line}
                    className="flex items-start gap-2 text-[12.5px] leading-relaxed text-muted"
                  >
                    <Package className="mt-0.5 size-3.5 shrink-0 text-line" aria-hidden />
                    {line}
                  </li>
                ))}
              </ul>
            </details>

            <details className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-[13px] font-medium text-content [&::-webkit-details-marker]:hidden">
                Shipping & returns
                <span className="text-subtle transition-transform duration-300 group-open:rotate-45">
                  +
                </span>
              </summary>
              <div className="mt-3 space-y-2 text-[12.5px] leading-relaxed text-muted">
                <p>
                  Orders ship within one business day from our Copenhagen studio.
                  Complimentary delivery on orders over $150; a flat $9 rate
                  applies below that.
                </p>
                <p>
                  Unhurried 30-day returns. Start a return from your account and
                  we&apos;ll email a prepaid label.
                </p>
              </div>
            </details>

            <details className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-[13px] font-medium text-content [&::-webkit-details-marker]:hidden">
                Care & repair
                <span className="text-subtle transition-transform duration-300 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-[12.5px] leading-relaxed text-muted">
                Wipe surfaces with a soft, dry cloth. Leather goods can be
                conditioned once a year with a neutral balm. If something needs
                attention, contact{" "}
                <a
                  href="mailto:support@velora.store"
                  className="text-accent-bright underline-offset-4 hover:underline"
                >
                  support@velora.store
                </a>{" "}
                and our studio will advise on repair.
              </p>
            </details>
          </div>
        </div>
      </div>

      <section id="reviews" className="mt-20 scroll-mt-24 border-t border-line-soft pt-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Ratings & reviews</p>
            <h2 className="mt-3 text-2xl font-medium tracking-tight text-content">
              {product.rating.toFixed(1)} out of 5
            </h2>
            <p className="mt-1 text-[12px] text-subtle">
              {product.reviewCount} ratings · seeded illustrative data
            </p>
          </div>
          <p className="max-w-sm text-[11px] leading-relaxed text-subtle">
            This demo storefront seeds its aggregate ratings for design
            purposes. Individual customer reviews are not stored in this build.
          </p>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {[
            {
              title: "Feels considered",
              body: "Materials and finishing are the first thing you notice. It reads as something meant to last.",
            },
            {
              title: "As described",
              body: "Dimensions, weight and colour matched the listing. Packaging was plastic-free.",
            },
            {
              title: "Would buy again",
              body: "A quiet, well-made object that has earned its place in the daily rotation.",
            },
          ].map((review) => (
            <figure
              key={review.title}
              className="rounded-xl border border-dashed border-line bg-white/[0.015] p-5"
            >
              <RatingStars rating={5} />
              <figcaption className="mt-3 text-[12.5px] font-medium text-content">
                {review.title}
                <span className="ml-2 text-[10px] font-normal uppercase tracking-[0.12em] text-subtle">
                  Sample
                </span>
              </figcaption>
              <blockquote className="mt-1.5 text-[12.5px] leading-relaxed text-subtle">
                {review.body}
              </blockquote>
            </figure>
          ))}
        </div>
      </section>

      {related.length > 0 ? (
        <section className="mt-20">
          <Reveal>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Pairs well with</p>
                <h2 className="mt-3 text-2xl font-medium tracking-tight text-content">
                  From the {product.category.name.toLowerCase()} collection
                </h2>
              </div>
              <Link
                href={`/shop?category=${product.category.slug}`}
                className="hidden text-[12px] font-medium text-muted transition-colors hover:text-content sm:inline"
              >
                View all →
              </Link>
            </div>
          </Reveal>
          <div className="mt-7">
            <ProductGrid products={related} columns={4} />
          </div>
        </section>
      ) : null}
    </div>
  );
}
