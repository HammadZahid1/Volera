import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Package, Plus } from "lucide-react";
import { AdminPagination } from "@/components/admin/pagination";
import { ProductRowActions } from "@/components/admin/product-row-actions";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/section";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import type { RawSearchParams } from "@/lib/catalog-params";

export const metadata: Metadata = {
  title: "Products",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 12;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  await requireAdmin("/admin/products");
  const raw = await searchParams;

  const q = (first(raw.q) ?? "").trim().slice(0, 80);
  const category = (first(raw.category) ?? "").trim();
  const rawStatus = first(raw.status) ?? "all";
  const status = ["all", "active", "archived", "low"].includes(rawStatus)
    ? rawStatus
    : "all";
  const requestedPage = Number(first(raw.page));
  const page = Number.isFinite(requestedPage)
    ? Math.max(1, Math.min(Math.round(requestedPage), 500))
    : 1;

  const where: Prisma.ProductWhereInput = {};
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { sku: { contains: q } },
      { slug: { contains: q } },
    ];
  }
  if (category) where.category = { slug: category };
  if (status === "active") where.isActive = true;
  if (status === "archived") where.isActive = false;
  if (status === "low") {
    where.isActive = true;
    where.stock = { lte: 5 };
  }

  const total = await db.product.count({ where });
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);

  const [products, categories, activeCount, archivedCount] = await Promise.all([
    db.product.findMany({
      where,
      include: {
        category: { select: { name: true } },
        images: { orderBy: { position: "asc" }, take: 1 },
        _count: { select: { orderItems: true } },
      },
      orderBy: [{ updatedAt: "desc" }],
      skip: (safePage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    db.product.count({ where: { isActive: true } }),
    db.product.count({ where: { isActive: false } }),
  ]);

  const query: Record<string, string> = {};
  if (q) query.q = q;
  if (category) query.category = category;
  if (status !== "all") query.status = status;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Catalogue</p>
          <h1 className="display mt-2 text-[clamp(1.8rem,3.6vw,2.5rem)] leading-[1.05] text-content">
            Products.
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            {activeCount} live · {archivedCount} archived · {total} matching
            this view.
          </p>
        </div>
        <Link href="/admin/products/new" className={buttonVariants({ size: "sm" })}>
          <Plus className="size-4" aria-hidden />
          New product
        </Link>
      </header>

      <form
        method="get"
        className="flex flex-wrap items-end gap-2.5 rounded-2xl border border-line bg-card/40 p-4"
      >
        <div className="min-w-[190px] flex-1">
          <Label htmlFor="product-search">Search</Label>
          <Input
            id="product-search"
            name="q"
            defaultValue={q}
            placeholder="Name, SKU or slug"
          />
        </div>
        <div className="w-full sm:w-[170px]">
          <Label htmlFor="product-category">Collection</Label>
          <Select id="product-category" name="category" defaultValue={category}>
            <option value="">All collections</option>
            {categories.map((item) => (
              <option key={item.id} value={item.slug}>
                {item.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-full sm:w-[150px]">
          <Label htmlFor="product-status">Status</Label>
          <Select id="product-status" name="status" defaultValue={status}>
            <option value="all">All</option>
            <option value="active">Live</option>
            <option value="archived">Archived</option>
            <option value="low">Low stock</option>
          </Select>
        </div>
        <button
          type="submit"
          className={buttonVariants({ variant: "secondary", size: "md" })}
        >
          Apply
        </button>
        <Link
          href="/admin/products"
          className={buttonVariants({ variant: "ghost", size: "md" })}
        >
          Reset
        </Link>
      </form>

      {products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products match"
          description="Try a different search or status, or add a new piece to the catalogue."
          action={
            <Link href="/admin/products/new" className={buttonVariants({ size: "md" })}>
              <Plus className="size-4" aria-hidden />
              New product
            </Link>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-card/55">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line-soft text-[10px] uppercase tracking-[0.14em] text-subtle">
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-3 py-3 font-medium">Collection</th>
                  <th className="px-3 py-3 font-medium">Price</th>
                  <th className="px-3 py-3 font-medium">Stock</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {products.map((product) => (
                  <tr key={product.id} className="align-middle text-[12px]">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="relative size-10 shrink-0 overflow-hidden rounded-lg border border-line-soft bg-surface">
                          {product.images[0] ? (
                            <Image
                              src={product.images[0].url}
                              alt={product.images[0].alt}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : null}
                        </span>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="block max-w-[15rem] truncate font-medium text-content transition-colors hover:text-accent-bright"
                          >
                            {product.name}
                          </Link>
                          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10.5px] text-subtle">
                            <span className="font-mono">{product.sku}</span>
                            {product.isFeatured ? (
                              <span className="text-accent/80">featured</span>
                            ) : null}
                            {product.isNew ? (
                              <span className="text-accent/80">new</span>
                            ) : null}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-muted">
                      {product.category.name}
                    </td>
                    <td className="px-3 py-3.5">
                      <p className="tabular-nums text-content">
                        {formatPrice(product.price)}
                      </p>
                      {product.compareAtPrice ? (
                        <p className="text-[10.5px] tabular-nums text-subtle line-through">
                          {formatPrice(product.compareAtPrice)}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-3 py-3.5">
                      <span
                        className={
                          product.stock === 0
                            ? "tabular-nums text-negative"
                            : product.stock <= 5
                              ? "tabular-nums text-warning"
                              : "tabular-nums text-content"
                        }
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      {product.isActive ? (
                        product.stock === 0 ? (
                          <Badge variant="danger">Sold out</Badge>
                        ) : (
                          <Badge variant="positive">Live</Badge>
                        )
                      ) : (
                        <Badge variant="neutral">Archived</Badge>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <ProductRowActions
                        productId={product.id}
                        productName={product.name}
                        isActive={product.isActive}
                        canDelete={product._count.orderItems === 0}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AdminPagination
        page={safePage}
        pageCount={pageCount}
        basePath="/admin/products"
        query={query}
      />
    </div>
  );
}
