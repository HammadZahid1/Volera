import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-line/80 bg-white/[0.015] px-6 py-16 text-center",
        className,
      )}
    >
      <div className="grid size-14 place-items-center rounded-2xl border border-line bg-card text-subtle">
        <Icon className="size-6" strokeWidth={1.4} />
      </div>
      <h2 className="mt-5 text-lg font-medium tracking-tight text-content">
        {title}
      </h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  action?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "sm:flex-col sm:items-center sm:text-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
        <h2 className="text-[1.75rem] font-medium leading-[1.15] tracking-[-0.02em] text-content sm:text-[2.1rem]">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
