import type { Metadata } from "next";
import Link from "next/link";
import { SearchX, X } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ProductGrid } from "@/components/product/product-grid";
import { CatalogFilters, CatalogSort } from "@/components/shop/catalog-controls";
import { Pagination } from "@/components/shop/pagination";
import { EmptyState } from "@/components/ui/section";
import { buttonVariants } from "@/components/ui/button";
import {
  activeFilterCount,
  buildCatalogHref,
  parseCatalogParams,
  type RawSearchParams,
} from "@/lib/catalog-params";
import {
  getCatalog,
  getCategories,
  getCategoryProductCounts,
  getPriceBounds,
} from "@/lib/products";
import { formatPrice, titleCase } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Shop all pieces",
  description:
    "Browse the full VELORA collection — audio, timepieces, leather goods, footwear, eyewear and objects for the considered home. Filter by category, price and availability.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const raw = await searchParams;
  const query = parseCatalogParams(raw);

  const [catalog, categories, counts, bounds] = await Promise.all([
    getCatalog({
      q: query.q,
      category: query.category,
      minPrice: query.min,
      maxPrice: query.max,
      inStock: query.inStock,
      sort: query.sort,
      page: query.page,
    }),
    getCategories(),
    getCategoryProductCounts(),
    getPriceBounds(),
  ]);

  const categoryOptions = categories.map((category) => ({
    name: category.name,
    slug: category.slug,
    count: counts.get(category.id) ?? 0,
  }));
  const totalCount = categoryOptions.reduce((sum, category) => sum + category.count, 0);
  const priceBounds = {
    min: Math.floor(bounds.min / 100),
    max: Math.ceil(bounds.max / 100),
  };
  const selectedCategory = categories.find((category) => category.slug === query.category);
  const filterCount = activeFilterCount(query);

  const priceLabel =
    typeof query.min === "number" && typeof query.max === "number"
      ? `${formatPrice(query.min * 100)} – ${formatPrice(query.max * 100)}`
      : typeof query.min === "number"
        ? `From ${formatPrice(query.min * 100)}`
        : typeof query.max === "number"
          ? `Up to ${formatPrice(query.max * 100)}`
          : null;

  const chips = [
    query.q
      ? {
          label: `“${query.q}”`,
          href: buildCatalogHref(query, { q: undefined, page: 1 }),
        }
      : null,
    query.category
      ? {
          label: selectedCategory?.name ?? titleCase(query.category),
          href: buildCatalogHref(query, { category: undefined, page: 1 }),
        }
      : null,
    priceLabel
      ? {
          label: priceLabel,
          href: buildCatalogHref(query, { min: undefined, max: undefined, page: 1 }),
        }
      : null,
    query.inStock
      ? {
          label: "In stock",
          href: buildCatalogHref(query, { inStock: false, page: 1 }),
        }
      : null,
  ].filter((chip): chip is { label: string; href: string } => Boolean(chip));

  return (
    <>
      <PageHeader
        eyebrow="The collection"
        title={selectedCategory ? selectedCategory.name : "Every piece, considered."}
        description={
          selectedCategory
            ? selectedCategory.description
            : "Twenty-five objects chosen for daily use and long ownership. Filter by category, price or availability — every piece ships from our studio."
        }
        breadcrumb={[
          { label: "Shop", href: "/shop" },
          ...(selectedCategory
            ? [{ label: selectedCategory.name }]
            : []),
        ]}
      >
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-subtle">
          <span>
            <span className="text-content">{totalCount}</span> pieces in the catalog
          </span>
          <span aria-hidden className="size-1 rounded-full bg-line" />
          <span>Free shipping over {formatPrice(15000)}</span>
          <span aria-hidden className="size-1 rounded-full bg-line" />
          <span>30-day returns</span>
        </div>
      </PageHeader>

      <div className="container-page py-10 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-12">
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <CatalogFilters
                categories={categoryOptions}
                totalCount={totalCount}
                priceBounds={priceBounds}
              />
            </div>
          </aside>

          <div>
            <CatalogSort
              categories={categoryOptions}
              totalCount={totalCount}
              priceBounds={priceBounds}
              resultCount={catalog.total}
            />

            {chips.length > 0 ? (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {chips.map((chip) => (
                  <Link
                    key={chip.label}
                    href={chip.href}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/[0.03] py-1 pl-3 pr-2 text-[11px] text-muted transition-colors hover:border-white/20 hover:text-content"
                  >
                    {chip.label}
                    <span className="grid size-4 place-items-center rounded-full bg-white/[0.06]">
                      <X className="size-2.5" aria-hidden />
                    </span>
                  </Link>
                ))}
                {chips.length > 1 ? (
                  <Link
                    href="/shop"
                    className="text-[11px] text-subtle underline-offset-4 transition-colors hover:text-content hover:underline"
                  >
                    Clear all
                  </Link>
                ) : null}
              </div>
            ) : null}

            <div className="mt-7">
              {catalog.items.length > 0 ? (
                <ProductGrid products={catalog.items} priorityCount={4} />
              ) : (
                <EmptyState
                  icon={SearchX}
                  title="No pieces match those filters"
                  description={
                    filterCount > 0
                      ? "Try widening the price range, clearing the search, or browsing the full collection."
                      : "The catalog is being updated. Please check back shortly."
                  }
                  action={
                    <Link
                      href="/shop"
                      className={buttonVariants({ variant: "secondary", size: "md" })}
                    >
                      Browse all pieces
                    </Link>
                  }
                />
              )}
            </div>

            <Pagination query={query} pageCount={catalog.pageCount} />

            {catalog.items.length > 0 ? (
              <p className="mt-6 text-center text-[11px] text-subtle">
                Showing {catalog.items.length} of {catalog.total} pieces
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
