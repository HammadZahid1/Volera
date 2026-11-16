import { Reveal } from "@/components/motion/reveal";
import { NewsletterForm } from "@/components/newsletter-form";

export function NewsletterPanel() {
  return (
    <section id="newsletter" className="container-page scroll-mt-24 py-20 lg:py-24">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] border border-accent/20 bg-gradient-to-br from-accent/[0.12] via-surface to-surface px-6 py-12 sm:px-10 lg:px-16 lg:py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-accent/20 blur-[100px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -left-20 size-72 rounded-full bg-azure/10 blur-[100px]"
          />

          <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="eyebrow text-accent/80">The VELORA letter</p>
              <h2 className="display mt-4 text-[clamp(2.1rem,4vw,3.2rem)] leading-[1.04] text-content">
                A slower kind of
                <br />
                <span className="italic text-accent-bright">inbox.</span>
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
                One considered note a month — new arrivals, studio notes, and
                the occasional recommendation. No urgency, no daily discounts.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-canvas/50 p-5 backdrop-blur-sm sm:p-6">
              <NewsletterForm variant="large" />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
