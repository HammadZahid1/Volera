import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";

const image =
  "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1400&q=80";

const notes = [
  "Full-grain leather that softens with wear",
  "Solid brass hardware, replaceable straps",
  "Made in small runs by a family workshop",
];

export function EditorialPromo() {
  return (
    <section className="container-page py-8 lg:py-12">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] border border-line-soft bg-surface">
          <div className="grid lg:grid-cols-[1.05fr_1fr]">
            <div className="relative min-h-[320px] lg:min-h-[460px]">
              <Image
                src={image}
                alt="Voyager weekender bag in full-grain leather"
                fill
                sizes="(max-width: 1024px) 100vw, 52vw"
                className="object-cover"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent lg:bg-gradient-to-r"
              />
              <div className="absolute left-6 top-6 rounded-full border border-white/20 bg-black/35 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-white/80 backdrop-blur-md">
                The Autumn Edit
              </div>
            </div>

            <div className="relative flex flex-col justify-center p-7 sm:p-10 lg:p-14">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-accent/10 blur-3xl"
              />
              <p className="eyebrow">Travel, considered</p>
              <h2 className="display mt-4 text-[clamp(2rem,4vw,3rem)] leading-[1.05] text-content">
                Pack lighter.
                <br />
                <span className="italic text-accent-bright">Arrive better.</span>
              </h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-muted">
                The Voyager Weekender is cut from a single hide, finished by
                hand, and sized for the overhead bin. A bag designed to be
                repaired, not replaced.
              </p>

              <ul className="mt-7 space-y-3">
                {notes.map((note) => (
                  <li key={note} className="flex items-start gap-2.5 text-[13px] text-muted">
                    <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-accent/15 text-accent-bright">
                      <Check className="size-2.5" aria-hidden />
                    </span>
                    {note}
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/product/voyager-weekender"
                  className={buttonVariants({ variant: "secondary", size: "md" })}
                >
                  Shop the Voyager
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
                <span className="text-[12px] text-subtle">$395 · Free shipping</span>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
