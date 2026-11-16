import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] whitespace-nowrap",
  {
    variants: {
      variant: {
        neutral: "border-line bg-white/[0.03] text-muted",
        accent: "border-accent/30 bg-accent/10 text-accent-bright",
        positive: "border-positive/25 bg-positive/10 text-positive",
        warning: "border-warning/25 bg-warning/10 text-warning",
        danger: "border-negative/25 bg-negative/10 text-negative",
        solid: "border-transparent bg-content text-canvas",
        outline: "border-line bg-transparent text-muted",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export type BadgeProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn("skeleton", className)}
      {...props}
    />
  );
}

export function Separator({ className }: { className?: string }) {
  return <div aria-hidden className={cn("hairline w-full", className)} />;
}
