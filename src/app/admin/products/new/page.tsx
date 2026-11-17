import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "New product",
  robots: { index: false, follow: false },
};

export default async function NewProductPage() {
  await requireAdmin("/admin/products/new");
  const categories = await db.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true },
  });

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
        <p className="eyebrow mt-5">Catalogue</p>
        <h1 className="display mt-2 text-[clamp(1.8rem,3.6vw,2.5rem)] leading-[1.05] text-content">
          New product.
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          Add a piece to the catalogue. Slugs and SKUs must be unique.
        </p>
      </div>

      <AdminProductForm
        mode="create"
        categories={categories}
        initial={{
          name: "",
          slug: "",
          sku: "",
          description: "",
          details: "",
          price: "",
          compareAtPrice: "",
          categoryId: categories[0]?.id ?? "",
          stock: "0",
          rating: "0",
          reviewCount: "0",
          isFeatured: false,
          isNew: true,
          isActive: true,
          images: [""],
        }}
      />
    </div>
  );
}
