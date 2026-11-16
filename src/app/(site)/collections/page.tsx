import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Reveal } from "@/components/motion/reveal";
import { buttonVariants } from "@/components/ui/button";
import { getCategories, getCategoryProductCounts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Collections",
  description:
    "Explore VELORA by discipline — audio, timepieces, bags, footwear, eyewear, home, desk and fragrance. Each collection is edited down to the pieces worth keeping.",
  alternates: { canonical: "/collections" },
};

export default async function CollectionsPage() {
  const [categories, counts] = await Promise.all([
    getCategories(),
    getCategoryProductCounts(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Eight disciplines"
        title="Collections with a point of view."
        description="We don't stock categories, we edit them. Each collection is a short list of objects that share the same standard — material honesty, repairability, and a design that settles rather than shouts."
        breadcrumb={[{ label: "Collections" }]}
      >
        <div className="flex flex-wrap gap-2">
          {categories.slice(0, 4).map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${category.slug}`}
              className="rounded-full border border-line px-3 py-1.5 text-[11px] text-muted transition-colors hover:border-white/20 hover:text-content"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </PageHeader>

      <div className="container-page py-12 lg:py-16">
        <div className="grid gap-5 sm:grid-cols-2">
          {categories.map((category, index) => {
            const count = counts.get(category.id) ?? 0;
            return (
              <Reveal key={category.id} delay={(index % 2) * 0.06}>
                <Link
                  href={`/shop?category=${category.slug}`}
                  className="group relative block overflow-hidden rounded-[1.5rem] border border-line-soft bg-surface"
                >
                  <div className="relative aspect-[16/11]">
                    <Image
                      src={category.imageUrl}
                      alt={`${category.name} collection`}
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-cover transition-transform duration-[1000ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/5"
                    />
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
                    <div className="flex items-end justify-between gap-4">
                      <div className="max-w-md">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">
                          {String(index + 1).padStart(2, "0")} · {count}{" "}
                          {count === 1 ? "piece" : "pieces"}
                        </p>
                        <h2 className="mt-2 text-[1.6rem] font-medium leading-tight tracking-tight text-white">
                          {category.name}
                        </h2>
                        <p className="mt-2 line-clamp-2 text-[12.5px] leading-relaxed text-white/65">
                          {category.description}
                        </p>
                      </div>
                      <span className="grid size-10 shrink-0 place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                        <ArrowUpRight className="size-4" aria-hidden />
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mt-14">
          <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-line-soft bg-card/60 p-6 sm:flex-row sm:items-center sm:p-8">
            <div>
              <p className="eyebrow">Undecided?</p>
              <h2 className="mt-2 text-xl font-medium tracking-tight text-content">
                Start with the pieces we reach for most.
              </h2>
              <p className="mt-1.5 text-[13px] text-muted">
                The featured selection is a good place to begin.
              </p>
            </div>
            <Link href="/shop?sort=featured" className={buttonVariants({ className: "shrink-0" })}>
              Shop the short list
            </Link>
          </div>
        </Reveal>
      </div>
    </>
  );
}
