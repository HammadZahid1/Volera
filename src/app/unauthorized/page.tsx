import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export const metadata: Metadata = {
  title: "Access restricted",
  robots: { index: false, follow: false },
};

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="container-page flex items-center justify-between py-6">
        <Logo />
        <Link
          href="/account"
          className="text-xs text-subtle transition-colors hover:text-content"
        >
          My account
        </Link>
      </header>

      <main className="container-page flex flex-1 items-center justify-center py-20">
        <div className="max-w-md text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl border border-negative/20 bg-negative/[0.06] text-negative">
            <ShieldAlert className="size-6" strokeWidth={1.5} />
          </div>
          <p className="eyebrow mt-6">Restricted area</p>
          <h1 className="mt-3 text-3xl font-medium tracking-[-0.03em] text-content">
            This section is for administrators
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Your account doesn&apos;t have permission to view the studio
            dashboard. If you believe this is a mistake, contact the VELORA
            team.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/" className={buttonVariants()}>
              Back to the store
            </Link>
            <Link
              href="/account"
              className="inline-flex h-11 items-center justify-center rounded-full border border-line px-5 text-sm text-content transition-colors hover:bg-white/5"
            >
              Go to my account
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
