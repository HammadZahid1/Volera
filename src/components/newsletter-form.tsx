"use client";

import { ArrowRight, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { subscribeAction } from "@/server/actions/wishlist";
import { newsletterSchema } from "@/lib/validation";
import { cn } from "@/lib/utils";

export function NewsletterForm({
  variant = "compact",
  className,
}: {
  variant?: "compact" | "large";
  className?: string;
}) {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const large = variant === "large";

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const parsed = newsletterSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter a valid email address.");
      return;
    }

    setPending(true);
    const result = await subscribeAction({ email: parsed.data.email });
    setPending(false);

    if (!result.ok) {
      setError(result.message ?? "Something went wrong. Please try again.");
      return;
    }

    setSubscribed(true);
    setEmail("");
    toast.success(result.message ?? "You're on the list.");
  };

  if (subscribed) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl border border-positive/25 bg-positive/[0.06] px-4 py-3.5",
          large && "justify-center py-5",
          className,
        )}
      >
        <span className="grid size-7 place-items-center rounded-full bg-positive/15 text-positive">
          <Check className="size-4" />
        </span>
        <p className={cn("text-sm text-positive", large && "text-[15px]")}>
          You&apos;re on the list. Watch your inbox.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn("w-full", className)}
      noValidate
      aria-label="Newsletter signup"
    >
      <div
        className={cn(
          "flex flex-col gap-2 sm:flex-row",
          large && "sm:gap-3",
        )}
      >
        <label htmlFor={`newsletter-email-${variant}`} className="sr-only">
          Email address
        </label>
        <input
          id={`newsletter-email-${variant}`}
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          className={cn(
            "w-full rounded-full border border-line bg-canvas-soft/90 px-5 text-sm text-content placeholder:text-subtle transition-colors focus:border-accent/60 focus:outline-none",
            large ? "h-13" : "h-11",
            error && "border-negative/60",
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `newsletter-error-${variant}` : undefined}
        />
        <button
          type="submit"
          disabled={pending}
          className={cn(
            "inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-accent font-medium text-[#0a0a10] transition-colors hover:bg-accent-bright disabled:opacity-60",
            large ? "h-13 px-7 text-sm" : "h-11 px-5 text-[13px]",
          )}
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              Subscribe
              <ArrowRight className="size-3.5" />
            </>
          )}
        </button>
      </div>
      {error ? (
        <p
          id={`newsletter-error-${variant}`}
          role="alert"
          className="mt-2 pl-2 text-xs text-negative"
        >
          {error}
        </p>
      ) : (
        <p
          className={cn(
            "mt-2.5 text-[11px] text-subtle",
            large ? "pl-1 text-center sm:text-left" : "pl-2",
          )}
        >
          Occasional notes on new arrivals and the studio. Unsubscribe anytime.
        </p>
      )}
    </form>
  );
}
