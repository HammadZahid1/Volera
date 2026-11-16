import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";
import type { Category } from "@prisma/client";

type CategoryCard = Pick<Category, "id" | "name" | "slug" | "imageUrl"> & {
  count: number;
};

export function CollectionsShowcase({
  categories,
  totalProducts,
}: {
  categories: CategoryCard[];
  totalProducts: number;
}) {
  const [lead, ...rest] = categories.slice(0, 6);

  return (
    <section className="container-page py-20 lg:py-24">
      <Reveal>
        <SectionHeading
          eyebrow="Shop by category"
          title="Built around the way you live"
          description="Eight disciplines, one point of view. Every category is edited down to the pieces worth keeping."
          action={
            <Link
              href="/collections"
              className="inline-flex items-center gap-2 text-[13px] font-medium text-content transition-colors hover:text-accent-bright"
            >
              All collections
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          }
        />
      </Reveal>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {lead ? (
          <Reveal className="sm:col-span-2" delay={0.05}>
            <CategoryTile category={lead} featured />
          </Reveal>
        ) : null}

        {rest.map((category, index) => (
          <Reveal key={category.id} delay={0.08 + index * 0.05}>
            <CategoryTile category={category} />
          </Reveal>
        ))}

        <Reveal delay={0.4} className="sm:col-span-2 lg:col-span-1">
          <Link
            href="/shop"
            className="group relative flex h-full min-h-[240px] flex-col justify-between overflow-hidden rounded-2xl border border-accent/25 bg-accent/[0.07] p-6 transition-colors hover:border-accent/50 hover:bg-accent/[0.11]"
          >
            <div
              aria-hidden
              className="absolute -right-10 -top-10 size-40 rounded-full bg-accent/20 blur-3xl transition-opacity group-hover:opacity-80"
            />
            <div className="relative">
              <p className="eyebrow text-accent/80">The full edit</p>
              <p className="display mt-3 text-[2rem] leading-[1.05] text-content">
                All {totalProducts} pieces
              </p>
            </div>
            <div className="relative flex items-center justify-between">
              <span className="text-[12px] text-muted">Browse the catalog</span>
              <span className="grid size-9 place-items-center rounded-full border border-accent/40 bg-accent/15 text-accent-bright transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                <ArrowUpRight className="size-4" aria-hidden />
              </span>
            </div>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

function CategoryTile({
  category,
  featured = false,
}: {
  category: CategoryCard;
  featured?: boolean;
}) {
  return (
    <Link
      href={`/shop?category=${category.slug}`}
      className={`group relative block overflow-hidden rounded-2xl border border-line-soft bg-surface ${
        featured ? "min-h-[240px] lg:min-h-[300px]" : "min-h-[240px]"
      }`}
    >
      <Image
        src={category.imageUrl}
        alt=""
        fill
        sizes={
          featured
            ? "(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 50vw"
            : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        }
        className="object-cover transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/5 transition-opacity duration-500 group-hover:from-black/90"
      />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/55">
            {category.count} {category.count === 1 ? "piece" : "pieces"}
          </p>
          <p className="mt-1.5 text-[17px] font-medium tracking-tight text-white">
            {category.name}
          </p>
        </div>
        <span className="grid size-8 shrink-0 place-items-center rounded-full border border-white/20 bg-white/10 text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:opacity-100">
          <ArrowUpRight className="size-3.5" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
