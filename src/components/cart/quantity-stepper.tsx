"use client";

import { Loader2, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuantityStepper({
  value,
  onChange,
  max = 10,
  min = 1,
  disabled = false,
  loading = false,
  label = "Quantity",
  size = "md",
}: {
  value: number;
  onChange: (next: number) => void;
  max?: number;
  min?: number;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
  size?: "sm" | "md";
}) {
  const buttonSize = size === "sm" ? "size-7" : "size-9";
  const valueWidth = size === "sm" ? "w-7 text-xs" : "w-9 text-sm";

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-line bg-canvas-soft/70",
        size === "sm" ? "h-8" : "h-10",
      )}
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={disabled || loading || value <= min}
        aria-label="Decrease quantity"
        className={cn(
          buttonSize,
          "grid place-items-center rounded-full text-muted transition-colors hover:text-content disabled:opacity-30 disabled:hover:text-muted",
        )}
      >
        <Minus className={size === "sm" ? "size-3" : "size-3.5"} />
      </button>
      <span
        className={cn(
          "grid place-items-center text-center font-medium tabular-nums text-content",
          valueWidth,
        )}
        aria-live="polite"
      >
        {loading ? <Loader2 className="size-3 animate-spin" /> : value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || loading || value >= max}
        aria-label="Increase quantity"
        className={cn(
          buttonSize,
          "grid place-items-center rounded-full text-muted transition-colors hover:text-content disabled:opacity-30 disabled:hover:text-muted",
        )}
      >
        <Plus className={size === "sm" ? "size-3" : "size-3.5"} />
      </button>
    </div>
  );
}
