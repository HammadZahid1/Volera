"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

type GalleryImage = { id: string; url: string; alt: string };

export function ProductGallery({
  images,
  productName,
  isNew,
}: {
  images: GalleryImage[];
  productName: string;
  isNew: boolean;
}) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div className="space-y-3">
      <div className="group relative overflow-hidden rounded-2xl border border-line-soft bg-surface">
        <div className="relative aspect-[4/5]">
          {current ? (
            <Image
              key={current.id}
              src={current.url}
              alt={current.alt || productName}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 52vw"
              className="object-cover transition-transform duration-[1100ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
            />
          ) : (
            <div className="grid h-full place-items-center text-sm text-subtle">
              Image coming soon
            </div>
          )}
        </div>
        {isNew ? (
          <span className="absolute left-4 top-4 rounded-full border border-accent/30 bg-canvas/80 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-accent-bright backdrop-blur">
            New arrival
          </span>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="grid grid-cols-4 gap-3" role="group" aria-label="Product images">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`View image ${index + 1} of ${images.length}`}
              aria-pressed={index === active}
              className={cn(
                "relative aspect-square overflow-hidden rounded-xl border transition-all duration-200",
                index === active
                  ? "border-accent/60 ring-1 ring-accent/30"
                  : "border-line-soft opacity-60 hover:opacity-100",
              )}
            >
              <Image
                src={image.url}
                alt=""
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
