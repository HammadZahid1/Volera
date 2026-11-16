import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumb = [],
  children,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  breadcrumb?: Array<{ label: string; href?: string }>;
  children?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <header className={cn("relative overflow-hidden border-b border-line-soft", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[42rem] -translate-x-1/2 rounded-full bg-accent/[0.07] blur-[100px]"
      />
      <div className="container-page relative py-10 sm:py-14 lg:py-16">
        {breadcrumb.length > 0 ? (
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1.5 text-[11px] text-subtle">
              <li>
                <Link href="/" className="transition-colors hover:text-content">
                  Home
                </Link>
              </li>
              {breadcrumb.map((crumb) => (
                <li key={crumb.label} className="flex items-center gap-1.5">
                  <ChevronRight className="size-3 text-line" aria-hidden />
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="transition-colors hover:text-content"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-muted" aria-current="page">
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        ) : null}

        <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h1 className="display mt-3 text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.03] text-content">
            {title}
          </h1>
          {description ? (
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted sm:text-[15px]">
              {description}
            </p>
          ) : null}
        </div>

        {children ? <div className="mt-6">{children}</div> : null}
      </div>
    </header>
  );
}
