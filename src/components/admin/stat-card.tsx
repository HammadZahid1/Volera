import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminStat({
  icon: Icon,
  label,
  value,
  hint,
  accent = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        accent
          ? "border-accent/25 bg-accent/[0.06]"
          : "border-line bg-card/50",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-subtle">
          {label}
        </p>
        <Icon
          className={cn("size-4", accent ? "text-accent-bright" : "text-accent/80")}
          strokeWidth={1.7}
          aria-hidden
        />
      </div>
      <p className="mt-2.5 text-[1.35rem] font-medium tabular-nums leading-none tracking-tight text-content">
        {value}
      </p>
      <p className="mt-2 text-[11px] leading-relaxed text-subtle">{hint}</p>
    </div>
  );
}
