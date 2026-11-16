import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildCatalogHref, type CatalogQuery } from "@/lib/catalog-params";
import { cn } from "@/lib/utils";

function pageWindow(current: number, total: number) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }
  const pages = new Set<number>([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);
  const withGaps: Array<number | "gap"> = [];
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) withGaps.push("gap");
    withGaps.push(page);
  });
  return withGaps;
}

export function Pagination({
  query,
  pageCount,
  className,
}: {
  query: CatalogQuery;
  pageCount: number;
  className?: string;
}) {
  if (pageCount <= 1) return null;

  const pages = pageWindow(query.page, pageCount);
  const linkClass =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-[12px] transition-colors";

  return (
    <nav
      aria-label="Pagination"
      className={cn("mt-12 flex flex-wrap items-center justify-center gap-1.5", className)}
    >
      {query.page > 1 ? (
        <Link
          href={buildCatalogHref(query, { page: query.page - 1 })}
          aria-label="Previous page"
          className={cn(linkClass, "border border-line text-muted hover:border-white/20 hover:text-content")}
        >
          <ChevronLeft className="size-4" aria-hidden />
        </Link>
      ) : (
        <span
          aria-disabled
          className={cn(linkClass, "border border-line/50 text-subtle/40")}
        >
          <ChevronLeft className="size-4" aria-hidden />
        </span>
      )}

      {pages.map((page, index) =>
        page === "gap" ? (
          <span key={`gap-${index}`} className="px-1 text-subtle" aria-hidden>
            …
          </span>
        ) : (
          <Link
            key={page}
            href={buildCatalogHref(query, { page })}
            aria-label={`Page ${page}`}
            aria-current={page === query.page ? "page" : undefined}
            className={cn(
              linkClass,
              page === query.page
                ? "bg-content font-medium text-canvas"
                : "text-muted hover:bg-white/[0.05] hover:text-content",
            )}
          >
            {page}
          </Link>
        ),
      )}

      {query.page < pageCount ? (
        <Link
          href={buildCatalogHref(query, { page: query.page + 1 })}
          aria-label="Next page"
          className={cn(linkClass, "border border-line text-muted hover:border-white/20 hover:text-content")}
        >
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      ) : (
        <span
          aria-disabled
          className={cn(linkClass, "border border-line/50 text-subtle/40")}
        >
          <ChevronRight className="size-4" aria-hidden />
        </span>
      )}
    </nav>
  );
}
