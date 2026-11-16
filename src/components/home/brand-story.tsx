import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Compass, Hammer, Leaf } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

const image =
  "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1400&q=80";

const principles = [
  {
    icon: Compass,
    title: "Edited, not endless",
    description:
      "Twenty-five pieces instead of twenty-five thousand. If it doesn't earn its place, it doesn't make the shelf.",
  },
  {
    icon: Hammer,
    title: "Made to be repaired",
    description:
      "Solid materials, standard fasteners, and a studio that will service what it sells for years to come.",
  },
  {
    icon: Leaf,
    title: "Quietly responsible",
    description:
      "Small production runs, plastic-free packaging, and carbon-neutral delivery on every order.",
  },
];

export function BrandStory() {
  return (
    <section className="container-page py-20 lg:py-24">
      <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
        <Reveal className="order-2 lg:order-1">
          <p className="eyebrow">The VELORA standard</p>
          <h2 className="display mt-4 text-[clamp(2.1rem,4.2vw,3.4rem)] leading-[1.04] text-content">
            Fewer things.
            <br />
            <span className="italic text-gradient">Better chosen.</span>
          </h2>
          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-muted">
            VELORA began as a rejection of the endless scroll. We work with a
            small circle of makers across Scandinavia and Japan, then bring back
            only the objects we would keep ourselves.
          </p>

          <div className="mt-9 space-y-6">
            {principles.map((principle) => (
              <div key={principle.title} className="flex gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-line bg-card text-accent">
                  <principle.icon className="size-[18px]" strokeWidth={1.5} aria-hidden />
                </span>
                <div>
                  <p className="text-[14px] font-medium text-content">
                    {principle.title}
                  </p>
                  <p className="mt-1 max-w-md text-[13px] leading-relaxed text-subtle">
                    {principle.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/about"
            className="mt-9 inline-flex items-center gap-2 text-[13px] font-medium text-content transition-colors hover:text-accent-bright"
          >
            Read the full story
            <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        </Reveal>

        <Reveal className="order-1 lg:order-2" delay={0.1}>
          <div className="relative">
            <div
              aria-hidden
              className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-tr from-accent/12 via-transparent to-azure/10 blur-2xl"
            />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-line-soft">
              <div className="relative aspect-[5/6]">
                <Image
                  src={image}
                  alt="A considered living room with the Form lounge chair"
                  fill
                  sizes="(max-width: 1024px) 100vw, 46vw"
                  className="object-cover"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent"
                />
              </div>
              <div className="absolute inset-x-6 bottom-6 rounded-xl border border-white/10 bg-black/40 p-4 backdrop-blur-md">
                <p className="display text-[15px] italic text-white/90">
                  “Buy once, keep it a decade, and let it age honestly.”
                </p>
                <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-white/50">
                  Studio principle no. 01
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
