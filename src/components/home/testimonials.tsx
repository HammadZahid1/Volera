import { Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/ui/rating";
import { Reveal } from "@/components/motion/reveal";

const testimonials = [
  {
    quote:
      "The Aurora headphones replaced a pair twice the price. Six months in, they still feel like the first week — and the case is genuinely beautiful.",
    name: "Elena M.",
    location: "Copenhagen",
    rating: 5,
    product: "Aurora Wireless Headphones",
  },
  {
    quote:
      "I ordered the Slate tote expecting a nice bag. What arrived is the only bag I've carried since — the leather has already started to soften.",
    name: "Daniel R.",
    location: "New York",
    rating: 5,
    product: "Slate Leather Tote",
  },
  {
    quote:
      "Delivery was quick, the packaging was plastic-free, and the watch was sized before it shipped. Small things, done properly.",
    name: "Priya S.",
    location: "London",
    rating: 4,
    product: "Meridian Automatic",
  },
];

export function Testimonials() {
  return (
    <section className="border-y border-line-soft bg-surface/40">
      <div className="container-page py-20 lg:py-24">
        <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <p className="eyebrow">In their words</p>
              <Badge variant="outline">Illustrative testimonials</Badge>
            </div>
            <h2 className="display mt-4 max-w-xl text-[clamp(2rem,3.8vw,3rem)] leading-[1.06] text-content">
              Considered by the people who keep it.
            </h2>
          </div>
          <p className="max-w-xs text-[12px] leading-relaxed text-subtle">
            Sample reviews written for this demo storefront. Product ratings and
            counts are seeded illustrative data, not verified purchases.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Reveal key={testimonial.name} delay={index * 0.08}>
              <figure className="flex h-full flex-col rounded-2xl border border-line-soft bg-card/70 p-6">
                <Quote className="size-5 text-accent/60" aria-hidden />
                <blockquote className="mt-4 flex-1 text-[13.5px] leading-relaxed text-muted">
                  “{testimonial.quote}”
                </blockquote>
                <figcaption className="mt-6 border-t border-line-soft pt-4">
                  <RatingStars rating={testimonial.rating} size="sm" />
                  <p className="mt-3 text-[13px] font-medium text-content">
                    {testimonial.name}
                    <span className="ml-2 font-normal text-subtle">
                      {testimonial.location}
                    </span>
                  </p>
                  <p className="mt-0.5 text-[11px] text-subtle">
                    On the {testimonial.product}
                  </p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
