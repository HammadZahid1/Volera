import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all duration-300 ease-[var(--ease-out-expo)] select-none active:scale-[0.985] disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-[#0a0a10] shadow-[0_12px_38px_-16px_rgba(139,124,255,0.9)] hover:bg-accent-bright hover:shadow-[0_16px_44px_-16px_rgba(139,124,255,0.8)]",
        secondary:
          "border border-line bg-white/[0.035] text-content hover:border-white/20 hover:bg-white/[0.06]",
        outline:
          "border border-accent/35 text-accent hover:border-accent/60 hover:bg-accent/10",
        ghost: "text-muted hover:bg-white/[0.05] hover:text-content",
        danger:
          "bg-negative/90 text-[#21060b] hover:bg-negative shadow-[0_12px_32px_-18px_rgba(255,100,124,0.8)]",
        link: "rounded-none text-accent underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-4 text-[13px]",
        md: "h-11 px-5 text-sm",
        lg: "h-[3.25rem] px-7 text-[15px]",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonBaseProps = VariantProps<typeof buttonVariants> & {
  loading?: boolean;
  children?: ReactNode;
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonBaseProps;

export function Button({
  className,
  variant,
  size,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : null}
      {children}
    </button>
  );
}
