import { RotateCcw, ShieldCheck, Truck, Sparkle } from "lucide-react";

const values = [
  {
    icon: Truck,
    title: "Complimentary delivery",
    description: "On every order over $150, tracked and insured.",
  },
  {
    icon: RotateCcw,
    title: "30-day returns",
    description: "Unhurried home trials, with prepaid return labels.",
  },
  {
    icon: ShieldCheck,
    title: "Two-year warranty",
    description: "Covered against defects, repaired by our studio.",
  },
  {
    icon: Sparkle,
    title: "Considered materials",
    description: "Responsibly sourced, built to patina not expire.",
  },
];

export function ValuesStrip() {
  return (
    <section aria-label="Why shop with VELORA" className="border-y border-line-soft bg-surface/40">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {values.map((value) => (
          <div key={value.title} className="flex items-start gap-3.5">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-line bg-card text-accent">
              <value.icon className="size-[18px]" strokeWidth={1.5} aria-hidden />
            </span>
            <div>
              <p className="text-[13px] font-medium text-content">{value.title}</p>
              <p className="mt-1 text-[12px] leading-relaxed text-subtle">
                {value.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
