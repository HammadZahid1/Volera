import { SORT_OPTIONS, type SortOption } from "@/lib/constants";

export type CatalogQuery = {
  q?: string;
  category?: string;
  min?: number;
  max?: number;
  inStock?: boolean;
  sort: SortOption;
  page: number;
};

export type RawSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function toNumber(value: string | undefined) {
  if (!value) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  return Math.round(parsed);
}

const sortValues = new Set<string>(SORT_OPTIONS.map((option) => option.value));

/** Parse and clamp catalog URL state so bad input never reaches the database. */
export function parseCatalogParams(params: RawSearchParams): CatalogQuery {
  const q = first(params.q)?.trim().slice(0, 80) || undefined;
  const category = first(params.category)?.trim().toLowerCase() ?? undefined;
  const rawMin = toNumber(first(params.min));
  const rawMax = toNumber(first(params.max));

  let min = rawMin === undefined ? undefined : Math.max(0, Math.min(rawMin, 1_000_000));
  let max = rawMax === undefined ? undefined : Math.max(0, Math.min(rawMax, 1_000_000));
  if (min !== undefined && max !== undefined && min > max) {
    [min, max] = [max, min];
  }

  const rawSort = first(params.sort);
  const sort =
    rawSort && sortValues.has(rawSort) ? (rawSort as SortOption) : "featured";

  const rawPage = toNumber(first(params.page));

  return {
    q,
    category: category && /^[a-z0-9-]{1,60}$/.test(category) ? category : undefined,
    min,
    max,
    inStock: first(params.inStock) === "1",
    sort,
    page: Math.max(1, Math.min(rawPage ?? 1, 500)),
  };
}

/** Build a canonical /shop URL, dropping defaults and resetting pagination. */
export function buildCatalogHref(
  query: CatalogQuery,
  overrides: Partial<CatalogQuery> = {},
) {
  const next = { ...query, ...overrides };
  const params = new URLSearchParams();

  if (next.q) params.set("q", next.q);
  if (next.category) params.set("category", next.category);
  if (typeof next.min === "number") params.set("min", String(next.min));
  if (typeof next.max === "number") params.set("max", String(next.max));
  if (next.inStock) params.set("inStock", "1");
  if (next.sort && next.sort !== "featured") params.set("sort", next.sort);
  if (next.page > 1) params.set("page", String(next.page));

  const search = params.toString();
  return search ? `/shop?${search}` : "/shop";
}

export function activeFilterCount(query: CatalogQuery) {
  return [
    Boolean(query.q),
    Boolean(query.category),
    typeof query.min === "number" || typeof query.max === "number",
    Boolean(query.inStock),
  ].filter(Boolean).length;
}
