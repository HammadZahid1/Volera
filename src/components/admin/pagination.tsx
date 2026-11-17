import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export function AdminPagination({
  page,
  pageCount,
  basePath,
  query,
}: {
  page: number;
  pageCount: number;
  basePath: string;
  query: Record<string, string>;
}) {
  const hrefFor = (target: number) => {
    const params = new URLSearchParams(query);
    if (target > 1) params.set("page", String(target));
    else params.delete("page");
    const search = params.toString();
    return search ? `${basePath}?${search}` : basePath;
  };

  if (pageCount <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between gap-3 border-t border-line-soft pt-4 text-[11.5px]"
    >
      {page > 1 ? (
        <Link
          href={hrefFor(page - 1)}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "px-2.5")}
        >
          Previous
        </Link>
      ) : (
        <span className="px-2.5 py-2 text-subtle/50">Previous</span>
      )}

      <span className="tabular-nums text-subtle">
        Page {page} of {pageCount}
      </span>

      {page < pageCount ? (
        <Link
          href={hrefFor(page + 1)}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "px-2.5")}
        >
          Next
        </Link>
      ) : (
        <span className="px-2.5 py-2 text-subtle/50">Next</span>
      )}
    </nav>
  );
}
