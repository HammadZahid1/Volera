import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { AdminProductForm } from "@/components/admin/product-form";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Edit product",
  robots: { index: false, follow: false },
};

const toInput = (cents: number) => String(cents / 100);

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireAdmin(`/admin/products/${id}/edit`);

  const [product, categories] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: { images: { orderBy: { position: "asc" } } },
    }),
    db.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-[12px] text-muted transition-colors hover:text-content"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          All products
        </Link>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Catalogue</p>
            <h1 className="display mt-2 text-[clamp(1.8rem,3.6vw,2.5rem)] leading-[1.05] text-content">
              {product.name}
            </h1>
            <p className="mt-2 font-mono text-[11px] text-subtle">
              {product.sku}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={product.isActive ? "positive" : "neutral"}>
              {product.isActive ? "Live" : "Archived"}
            </Badge>
            <Link
              href={`/product/${product.slug}`}
              className="inline-flex items-center gap-1.5 text-[11.5px] text-muted transition-colors hover:text-content"
            >
              View on storefront
              <ArrowUpRight className="size-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>

      <AdminProductForm
        mode="edit"
        productId={product.id}
        categories={categories}
        initial={{
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          description: product.description,
          details: product.details,
          price: toInput(product.price),
          compareAtPrice:
            product.compareAtPrice === null
              ? ""
              : toInput(product.compareAtPrice),
          categoryId: product.categoryId,
          stock: String(product.stock),
          rating: String(product.rating),
          reviewCount: String(product.reviewCount),
          isFeatured: product.isFeatured,
          isNew: product.isNew,
          isActive: product.isActive,
          images: product.images.map((image) => image.url),
        }}
      />
    </div>
  );
}
