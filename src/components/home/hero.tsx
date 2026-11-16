"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

const heroImage =
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1400&q=80";
const detailImage =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80";

export function Hero() {
  const reduceMotion = useReducedMotion();

  const rise = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 28 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.9, delay, ease: EASE },
        };

  return (
    <section className="relative overflow-hidden pb-16 pt-10 sm:pt-14 lg:pb-24 lg:pt-16">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 -top-24 size-[34rem] rounded-full bg-accent/[0.09] blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-40 size-[28rem] rounded-full bg-azure/[0.06] blur-[120px]"
      />

      <div className="container-page relative grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div className="max-w-xl">
          <motion.div {...rise(0.05)}>
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/[0.07] px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-accent-bright">
              <Sparkles className="size-3" aria-hidden />
              The Autumn Edit — 2026
            </span>
          </motion.div>

          <motion.h1
            {...rise(0.14)}
            className="mt-6 text-[clamp(2.6rem,6vw,4.5rem)] font-medium leading-[0.98] tracking-[-0.035em] text-content"
          >
            Objects for a{" "}
            <span className="display italic text-gradient">quieter</span>
            <br />
            kind of luxury.
          </motion.h1>

          <motion.p
            {...rise(0.24)}
            className="mt-6 max-w-md text-[15px] leading-relaxed text-muted"
          >
            A tightly curated collection of audio, timepieces, leather and
            objects for the considered home — chosen for how they feel on the
            hundredth day, not the first.
          </motion.p>

          <motion.div
            {...rise(0.32)}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link href="/shop" className={buttonVariants({ size: "lg" })}>
              Explore the collection
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/about"
              className={buttonVariants({ variant: "secondary", size: "lg" })}
            >
              Our story
              <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </motion.div>

          <motion.dl
            {...rise(0.42)}
            className="mt-12 grid max-w-md grid-cols-3 gap-4 border-t border-line-soft pt-6"
          >
            {[
              { value: "25", label: "Curated pieces" },
              { value: "4.8", label: "Average rating" },
              { value: "2 yr", label: "Limited warranty" },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd className="text-xl font-medium tracking-tight text-content">
                  {stat.value}
                </dd>
                <dd className="mt-1 text-[11px] uppercase tracking-[0.14em] text-subtle">
                  {stat.label}
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <motion.div
          className="relative mx-auto w-full max-w-[34rem]"
          initial={reduceMotion ? undefined : { opacity: 0, scale: 0.97 }}
          animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.15, ease: EASE }}
        >
          <div
            aria-hidden
            className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-b from-accent/15 via-transparent to-transparent blur-2xl"
          />

          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-surface shadow-[0_50px_120px_-40px_rgba(0,0,0,0.9)]">
            <div className="relative aspect-[4/5]">
              <Image
                src={heroImage}
                alt="Aurora wireless headphones resting on a dark surface"
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 42vw"
                className="object-cover"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent"
              />
            </div>

            <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/55">
                  Editor&apos;s pick
                </p>
                <p className="mt-1.5 text-lg font-medium tracking-tight text-white">
                  Aurora Wireless
                </p>
                <p className="mt-0.5 text-[12px] text-white/60">
                  40-hour ANC headphones · $289
                </p>
              </div>
              <Link
                href="/product/aurora-wireless-headphones"
                aria-label="View Aurora Wireless Headphones"
                className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-canvas transition-transform duration-300 hover:scale-105"
              >
                <ArrowUpRight className="size-5" aria-hidden />
              </Link>
            </div>
          </div>

          <div className="absolute -bottom-8 -left-4 hidden w-36 overflow-hidden rounded-2xl border border-white/12 bg-card shadow-[0_30px_60px_-24px_rgba(0,0,0,0.9)] sm:block lg:-left-10 lg:w-44">
            <div className="relative aspect-square">
              <Image
                src={detailImage}
                alt="Meridian automatic watch detail"
                fill
                sizes="180px"
                className="object-cover"
              />
            </div>
            <div className="px-3 py-2.5">
              <p className="text-[11px] font-medium text-content">Meridian Automatic</p>
              <p className="text-[10px] text-subtle">Swiss movement · $420</p>
            </div>
          </div>

          <div className="absolute -right-2 top-6 hidden rounded-full border border-white/12 bg-black/55 px-3.5 py-2 text-[10px] font-medium uppercase tracking-[0.16em] text-white/80 backdrop-blur-md sm:block lg:-right-6">
            Free shipping over $150
          </div>
        </motion.div>
      </div>
    </section>
  );
}
