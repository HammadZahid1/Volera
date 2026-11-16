import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { DEFAULT_PAGE_SIZE, type SortOption } from "@/lib/constants";

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  rating: number;
  reviewCount: number;
  isNew: boolean;
  isFeatured: boolean;
  image: { url: string; alt: string };
  category: { name: string; slug: string };
};

const cardInclude = {
  images: { orderBy: { position: "asc" }, take: 1 },
  category: { select: { name: true, slug: true } },
} satisfies Prisma.ProductInclude;

type CardPayload = Prisma.ProductGetPayload<{ include: typeof cardInclude }>;

export function toProductCard(product: CardPayload): ProductCardData {
  const image = product.images[0];
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    stock: product.stock,
    rating: product.rating,
    reviewCount: product.reviewCount,
    isNew: product.isNew,
    isFeatured: product.isFeatured,
    image: {
      url: image?.url ?? "",
      alt: image?.alt ?? product.name,
    },
    category: {
      name: product.category.name,
      slug: product.category.slug,
    },
  };
}

const active = { isActive: true } as const;

export async function getFeaturedProducts(limit = 8) {
  const products = await db.product.findMany({
    where: { ...active, isFeatured: true },
    include: cardInclude,
    orderBy: [{ createdAt: "desc" }],
    take: limit,
  });
  return products.map(toProductCard);
}

export async function getNewArrivals(limit = 8) {
  const products = await db.product.findMany({
    where: { ...active, isNew: true },
    include: cardInclude,
    orderBy: [{ createdAt: "desc" }],
    take: limit,
  });
  return products.map(toProductCard);
}

export async function getNewArrivalCount() {
  return db.product.count({ where: { ...active, isNew: true } });
}

export async function getProductBySlug(slug: string) {
  return db.product.findFirst({
    where: { slug, isActive: true },
    include: {
      images: { orderBy: { position: "asc" } },
      category: true,
    },
  });
}

export async function getRelatedProducts(
  productId: string,
  categoryId: string,
  limit = 4,
) {
  const products = await db.product.findMany({
    where: { ...active, categoryId, id: { not: productId } },
    include: cardInclude,
    orderBy: [{ isFeatured: "desc" }, { rating: "desc" }],
    take: limit,
  });
  return products.map(toProductCard);
}

export async function getCategories() {
  return db.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
}

export async function getCategoryBySlug(slug: string) {
  return db.category.findUnique({ where: { slug } });
}

export async function getCategoryProductCounts() {
  const grouped = await db.product.groupBy({
    by: ["categoryId"],
    where: active,
    _count: { _all: true },
  });
  return new Map(grouped.map((row) => [row.categoryId, row._count._all]));
}

export async function getPriceBounds() {
  const result = await db.product.aggregate({
    where: active,
    _min: { price: true },
    _max: { price: true },
  });
  return {
    min: result._min.price ?? 0,
    max: result._max.price ?? 0,
  };
}

export type CatalogParams = {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: SortOption;
  page?: number;
};

export type CatalogResult = {
  items: ProductCardData[];
  total: number;
  page: number;
  pageCount: number;
  pageSize: number;
};

function orderByFor(sort: SortOption | undefined): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "newest":
      return [{ createdAt: "desc" }, { id: "desc" }];
    case "price-asc":
      return [{ price: "asc" }, { name: "asc" }];
    case "price-desc":
      return [{ price: "desc" }, { name: "asc" }];
    case "rating":
      return [{ rating: "desc" }, { reviewCount: "desc" }];
    case "featured":
    default:
      return [{ isFeatured: "desc" }, { createdAt: "desc" }, { id: "desc" }];
  }
}

export async function getCatalog(
  params: CatalogParams,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<CatalogResult> {
  const where: Prisma.ProductWhereInput = { ...active };

  if (params.q) {
    where.OR = [
      { name: { contains: params.q } },
      { description: { contains: params.q } },
      { category: { name: { contains: params.q } } },
    ];
  }

  if (params.category) {
    where.category = { slug: params.category };
  }

  if (typeof params.minPrice === "number" || typeof params.maxPrice === "number") {
    where.price = {
      ...(typeof params.minPrice === "number"
        ? { gte: Math.round(params.minPrice * 100) }
        : {}),
      ...(typeof params.maxPrice === "number"
        ? { lte: Math.round(params.maxPrice * 100) }
        : {}),
    };
  }

  if (params.inStock) {
    where.stock = { gt: 0 };
  }

  const total = await db.product.count({ where });
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, params.page ?? 1), pageCount);

  const products = await db.product.findMany({
    where,
    include: cardInclude,
    orderBy: orderByFor(params.sort),
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return {
    items: products.map(toProductCard),
    total,
    page,
    pageCount,
    pageSize,
  };
}

export async function searchProducts(query: string, limit = 6) {
  const q = query.trim();
  if (!q) return [];
  const products = await db.product.findMany({
    where: {
      ...active,
      OR: [
        { name: { contains: q } },
        { description: { contains: q } },
        { category: { name: { contains: q } } },
      ],
    },
    include: cardInclude,
    orderBy: [{ isFeatured: "desc" }, { rating: "desc" }],
    take: limit,
  });
  return products.map(toProductCard);
}

export async function getAllProductSlugs() {
  return db.product.findMany({
    where: active,
    select: { slug: true, updatedAt: true },
  });
}

export async function getWishlistProducts(userId: string) {
  const rows = await db.wishlistItem.findMany({
    where: { userId, product: { isActive: true } },
    include: { product: { include: cardInclude } },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((row) => toProductCard(row.product));
}

export async function getProductStats() {
  const [total, activeCount, outOfStock, lowStock] = await Promise.all([
    db.product.count(),
    db.product.count({ where: active }),
    db.product.count({ where: { ...active, stock: 0 } }),
    db.product.count({ where: { ...active, stock: { gt: 0, lte: 5 } } }),
  ]);
  return { total, activeCount, outOfStock, lowStock };
}
