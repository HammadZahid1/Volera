import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  showWordmark = true,
  href = "/",
}: {
  className?: string;
  showWordmark?: boolean;
  href?: string;
}) {
  return (
    <Link
      href={href}
      aria-label="VELORA home"
      className={cn(
        "group inline-flex items-center gap-2.5 transition-opacity hover:opacity-90",
        className,
      )}
    >
      <span className="relative grid size-8 place-items-center rounded-[10px] border border-white/10 bg-white/[0.04]">
        <svg
          viewBox="0 0 24 24"
          aria-hidden
          className="size-4 text-accent transition-transform duration-500 group-hover:rotate-[8deg]"
        >
          <path
            d="M3.5 4.5h4.2L12 15.1 16.3 4.5h4.2L13.7 20h-3.4L3.5 4.5Z"
            fill="currentColor"
          />
        </svg>
        <span className="absolute -inset-px rounded-[10px] bg-gradient-to-b from-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </span>
      {showWordmark ? (
        <span className="text-[15px] font-semibold uppercase tracking-[0.34em] text-content">
          Velora
        </span>
      ) : null}
    </Link>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cn("size-5 text-accent", className)}
    >
      <path
        d="M3.5 4.5h4.2L12 15.1 16.3 4.5h4.2L13.7 20h-3.4L3.5 4.5Z"
        fill="currentColor"
      />
    </svg>
  );
}
