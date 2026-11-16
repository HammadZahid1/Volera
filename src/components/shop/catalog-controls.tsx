"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useState, useTransition } from "react";
import { Check, RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { Drawer } from "@/components/ui/overlay";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { activeFilterCount, parseCatalogParams } from "@/lib/catalog-params";
import type { SortOption } from "@/lib/constants";

type CategoryOption = { name: string; slug: string; count: number };

const quickRanges = [
  { label: "Under $100", min: undefined, max: 100 },
  { label: "$100 – $250", min: 100, max: 250 },
  { label: "$250+", min: 250, max: undefined },
];

export function CatalogFilters({
  categories,
  totalCount,
  priceBounds,
  onNavigate,
}: {
  categories: CategoryOption[];
  totalCount: number;
  priceBounds: { min: number; max: number };
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [min, setMin] = useState(searchParams.get("min") ?? "");
  const [max, setMax] = useState(searchParams.get("max") ?? "");
  const idPrefix = useId();

  const query = parseCatalogParams(
    Object.fromEntries(searchParams.entries()),
  );
  const activeCount = activeFilterCount(query);

  useEffect(() => {
    setSearch(searchParams.get("q") ?? "");
    setMin(searchParams.get("min") ?? "");
    setMax(searchParams.get("max") ?? "");
  }, [searchParams]);

  const update = (mutate: (params: URLSearchParams) => void, resetPage = true) => {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    if (resetPage) params.delete("page");
    if (params.get("sort") === "featured") params.delete("sort");
    if (params.get("inStock") !== "1") params.delete("inStock");

    const next = params.toString();
    startTransition(() => {
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
      onNavigate?.();
    });
  };

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const value = search.trim();
    update((params) => {
      if (value) params.set("q", value);
      else params.delete("q");
    });
  };

  const submitPrice = (event: React.FormEvent) => {
    event.preventDefault();
    const minValue = min === "" ? undefined : Math.max(0, Math.round(Number(min)));
    const maxValue = max === "" ? undefined : Math.max(0, Math.round(Number(max)));

    update((params) => {
      if (typeof minValue === "number" && Number.isFinite(minValue)) {
        params.set("min", String(minValue));
      } else {
        params.delete("min");
      }
      if (typeof maxValue === "number" && Number.isFinite(maxValue)) {
        params.set("max", String(maxValue));
      } else {
        params.delete("max");
      }
    });
  };

  const applyRange = (range: (typeof quickRanges)[number]) => {
    setMin(range.min === undefined ? "" : String(range.min));
    setMax(range.max === undefined ? "" : String(range.max));
    update((params) => {
      if (range.min === undefined) params.delete("min");
      else params.set("min", String(range.min));
      if (range.max === undefined) params.delete("max");
      else params.set("max", String(range.max));
    });
  };

  const reset = () => {
    setSearch("");
    setMin("");
    setMax("");
    startTransition(() => {
      router.replace(pathname, { scroll: false });
      onNavigate?.();
    });
  };

  return (
    <div
      className={cn("space-y-7", isPending && "opacity-70 transition-opacity")}
      aria-busy={isPending || undefined}
    >
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
            Filters
          </p>
          {activeCount > 0 ? (
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-subtle transition-colors hover:text-content"
            >
              <RotateCcw className="size-3" aria-hidden />
              Reset
            </button>
          ) : null}
        </div>
        <form onSubmit={submitSearch} role="search" className="relative">
          <label htmlFor={`${idPrefix}-search`} className="sr-only">
            Search products
          </label>
          <Input
            id={`${idPrefix}-search`}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search the collection"
            leftIcon={<Search className="size-4" />}
            className="pr-10"
          />
          {search ? (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                update((params) => params.delete("q"));
              }}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-subtle transition-colors hover:bg-white/5 hover:text-content"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </form>
      </div>

      <fieldset>
        <legend className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
          Category
        </legend>
        <div className="space-y-0.5">
          <CategoryButton
            active={!query.category}
            onClick={() => update((params) => params.delete("category"))}
            label="All pieces"
            count={totalCount}
          />
          {categories.map((category) => (
            <CategoryButton
              key={category.slug}
              active={query.category === category.slug}
              onClick={() =>
                update((params) => {
                  if (query.category === category.slug) params.delete("category");
                  else params.set("category", category.slug);
                })
              }
              label={category.name}
              count={category.count}
            />
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
          Price
        </legend>
        <form onSubmit={submitPrice} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor={`${idPrefix}-min`} className="sr-only">
                Minimum price
              </label>
              <Input
                id={`${idPrefix}-min`}
                inputMode="numeric"
                value={min}
                onChange={(event) => setMin(event.target.value.replace(/[^\d]/g, ""))}
                placeholder={String(Math.floor(priceBounds.min / 100))}
                className="h-10 text-[13px]"
                aria-label="Minimum price in dollars"
              />
            </div>
            <div>
              <label htmlFor={`${idPrefix}-max`} className="sr-only">
                Maximum price
              </label>
              <Input
                id={`${idPrefix}-max`}
                inputMode="numeric"
                value={max}
                onChange={(event) => setMax(event.target.value.replace(/[^\d]/g, ""))}
                placeholder={String(Math.ceil(priceBounds.max / 100))}
                className="h-10 text-[13px]"
                aria-label="Maximum price in dollars"
              />
            </div>
          </div>
          <Button type="submit" variant="secondary" size="sm" className="w-full">
            Apply price
          </Button>
        </form>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {quickRanges.map((range) => {
            const active =
              query.min === range.min && query.max === range.max;
            return (
              <button
                key={range.label}
                type="button"
                onClick={() => applyRange(range)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11px] transition-colors",
                  active
                    ? "border-accent/40 bg-accent/10 text-accent-bright"
                    : "border-line text-subtle hover:border-white/20 hover:text-content",
                )}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="border-t border-line-soft pt-6">
        <label className="flex cursor-pointer items-center justify-between gap-3">
          <span className="text-[12px] text-muted">In stock only</span>
          <span
            className={cn(
              "relative inline-flex h-6 w-10 shrink-0 items-center rounded-full border transition-colors",
              query.inStock
                ? "border-accent/50 bg-accent/25"
                : "border-line bg-canvas-soft",
            )}
          >
            <input
              type="checkbox"
              checked={query.inStock}
              onChange={(event) =>
                update((params) => {
                  if (event.target.checked) params.set("inStock", "1");
                  else params.delete("inStock");
                })
              }
              className="peer sr-only"
            />
            <span
              aria-hidden
              className={cn(
                "ml-0.5 grid size-[18px] place-items-center rounded-full bg-white/60 transition-transform duration-200",
                query.inStock && "translate-x-4 bg-accent text-[#0a0a10]",
              )}
            >
              {query.inStock ? <Check className="size-3" /> : null}
            </span>
          </span>
        </label>
      </div>
    </div>
  );
}

function CategoryButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors",
        active
          ? "bg-white/[0.06] text-content"
          : "text-muted hover:bg-white/[0.03] hover:text-content",
      )}
    >
      <span className="flex items-center gap-2">
        <span
          aria-hidden
          className={cn(
            "size-1.5 rounded-full transition-colors",
            active ? "bg-accent" : "bg-line",
          )}
        />
        {label}
      </span>
      <span className="text-[11px] tabular-nums text-subtle">{count}</span>
    </button>
  );
}

export function CatalogSort({
  categories,
  totalCount,
  priceBounds,
  resultCount,
}: {
  categories: CategoryOption[];
  totalCount: number;
  priceBounds: { min: number; max: number };
  resultCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const query = parseCatalogParams(Object.fromEntries(searchParams.entries()));

  const onSort = (value: SortOption) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "featured") params.delete("sort");
    else params.set("sort", value);
    params.delete("page");
    const next = params.toString();
    startTransition(() =>
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false }),
    );
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-white/[0.03] px-4 text-[13px] text-content transition-colors hover:border-white/20 lg:hidden"
          >
            <SlidersHorizontal className="size-4" aria-hidden />
            Filters
            {activeFilterCount(query) > 0 ? (
              <span className="grid size-5 place-items-center rounded-full bg-accent text-[10px] font-semibold text-[#0a0a10]">
                {activeFilterCount(query)}
              </span>
            ) : null}
          </button>
          <p className="text-[12px] text-subtle" aria-live="polite">
            {resultCount} {resultCount === 1 ? "piece" : "pieces"}
            {query.category ? " in this category" : ""}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="catalog-sort" className="text-[11px] text-subtle">
            Sort
          </label>
          <div className="relative">
            <select
              id="catalog-sort"
              value={query.sort}
              onChange={(event) => onSort(event.target.value as SortOption)}
              disabled={isPending}
              className="h-10 appearance-none rounded-full border border-line bg-canvas-soft pl-4 pr-9 text-[12px] text-content transition-colors hover:border-white/20 focus:border-accent/60 focus:outline-none"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="rating">Best rated</option>
            </select>
            <svg
              aria-hidden
              viewBox="0 0 12 12"
              className="pointer-events-none absolute right-3.5 top-1/2 size-2.5 -translate-y-1/2 text-subtle"
            >
              <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
      </div>

      <MobileFilters
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        categories={categories}
        totalCount={totalCount}
        priceBounds={priceBounds}
      />
    </>
  );
}

function MobileFilters({
  open,
  onClose,
  categories,
  totalCount,
  priceBounds,
}: {
  open: boolean;
  onClose: () => void;
  categories: CategoryOption[];
  totalCount: number;
  priceBounds: { min: number; max: number };
}) {
  return (
    <Drawer open={open} onClose={onClose} title="Filters" side="left">
      <div className="p-5">
        <CatalogFilters
          categories={categories}
          totalCount={totalCount}
          priceBounds={priceBounds}
          onNavigate={onClose}
        />
      </div>
    </Drawer>
  );
}
