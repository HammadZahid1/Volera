import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { SITE } from "@/lib/constants";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.02fr_1fr]">
      <aside className="relative hidden overflow-hidden border-r border-line lg:block">
        <Image
          src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1600&q=80"
          alt="Editorial fashion portrait in soft natural light"
          fill
          priority
          sizes="50vw"
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/40 to-canvas/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-canvas/60" />

        <div className="absolute left-10 top-10">
          <Logo />
        </div>

        <div className="absolute inset-x-10 bottom-12 max-w-md">
          <p className="eyebrow mb-4">The VELORA standard</p>
          <p className="display text-[2.6rem] leading-[1.08] text-content">
            Objects of quiet intent,
            <br />
            <span className="text-gradient">made for every day.</span>
          </p>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">
            A considered edit of audio, timepieces, leather goods and objects
            for the home — chosen for how they feel, not how loudly they
            announce themselves.
          </p>
        </div>
      </aside>

      <main className="relative flex min-h-dvh flex-col">
        <header className="flex items-center justify-between px-5 py-6 sm:px-8">
          <div className="lg:hidden">
            <Logo />
          </div>
          <Link
            href="/"
            className="ml-auto inline-flex items-center gap-1.5 text-[12px] text-subtle transition-colors hover:text-content"
          >
            <ArrowLeft className="size-3.5" />
            Back to store
          </Link>
        </header>

        <div className="flex flex-1 items-center justify-center px-5 pb-14 pt-4 sm:px-8">
          <div className="w-full max-w-[420px]">{children}</div>
        </div>

        <footer className="px-5 py-6 text-center text-[11px] text-subtle sm:px-8">
          © {new Date().getFullYear()} {SITE.name} · A portfolio demonstration
          store
        </footer>
      </main>
    </div>
  );
}
