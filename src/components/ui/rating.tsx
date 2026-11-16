import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({
  rating,
  reviewCount,
  className,
  size = "sm",
}: {
  rating: number;
  reviewCount?: number;
  className?: string;
  size?: "sm" | "md";
}) {
  const starSize = size === "sm" ? "size-3" : "size-3.5";
  return (
    <div
      className={cn("flex items-center gap-1.5", className)}
      aria-label={`Rated ${rating.toFixed(1)} out of 5`}
    >
      <span className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            aria-hidden
            className={cn(
              starSize,
              index < Math.round(rating)
                ? "fill-warning text-warning"
                : "fill-transparent text-line",
            )}
          />
        ))}
      </span>
      <span className="text-[11px] font-medium text-muted">
        {rating.toFixed(1)}
      </span>
      {typeof reviewCount === "number" ? (
        <span className="text-[11px] text-subtle">({reviewCount})</span>
      ) : null}
    </div>
  );
}
