"use client";

import { Loader2, Search, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Dialog } from "@/components/ui/overlay";
import { formatPrice } from "@/lib/utils";

type SearchResult = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: { url: string; alt: string };
  category: { name: string; slug: string };
};

const SUGGESTIONS = ["Headphones", "Watches", "Leather", "Lighting", "Fragrance"];

export function SearchDialog({
  open,
  onClose,
  categories,
}: {
  open: boolean;
  onClose: () => void;
  categories: Array<{ name: string; slug: string }>;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setSearched(false);
    }
  }, [open]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setSearched(false);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error("Search failed");
        const data = (await response.json()) as { results: SearchResult[] };
        setResults(data.results ?? []);
        setSearched(true);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setResults([]);
          setSearched(true);
        }
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  const submit = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onClose();
    router.push(`/shop?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <Dialog open={open} onClose={onClose} className="max-w-2xl overflow-hidden p-0">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit(query);
        }}
        className="flex items-center gap-3 border-b border-line px-5 py-4"
      >
        <Search className="size-4 shrink-0 text-subtle" />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search audio, watches, leather goods…"
          aria-label="Search products"
          className="h-8 w-full bg-transparent text-sm text-content outline-none placeholder:text-subtle"
        />
        {loading ? <Loader2 className="size-4 animate-spin text-subtle" /> : null}
        <kbd className="hidden rounded-md border border-line px-1.5 py-0.5 text-[10px] text-subtle sm:block">
          ESC
        </kbd>
      </form>

      <div className="scrollbar-slim max-h-[58vh] overflow-y-auto">
        {query.trim().length < 2 ? (
          <div className="p-5">
            <p className="eyebrow mb-4">Popular searches</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setQuery(suggestion)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/[0.02] px-3 py-1.5 text-xs text-muted transition-colors hover:border-white/20 hover:text-content"
                >
                  <TrendingUp className="size-3" />
                  {suggestion}
                </button>
              ))}
            </div>

            <p className="eyebrow mb-4 mt-8">Browse collections</p>
            <div className="grid grid-cols-2 gap-1.5">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/shop?category=${category.slug}`}
                  onClick={onClose}
                  className="rounded-lg px-3 py-2.5 text-sm text-muted transition-colors hover:bg-white/[0.04] hover:text-content"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        ) : results.length > 0 ? (
          <div className="p-2">
            <p className="eyebrow px-3 py-2">Products</p>
            <ul>
              {results.map((result) => (
                <li key={result.id}>
                  <Link
                    href={`/product/${result.slug}`}
                    onClick={onClose}
                    className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/[0.04]"
                  >
                    <span className="relative block size-12 shrink-0 overflow-hidden rounded-md border border-line-soft bg-canvas-soft">
                      {result.image.url ? (
                        <Image
                          src={result.image.url}
                          alt={result.image.alt}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-content group-hover:text-accent-bright">
                        {result.name}
                      </span>
                      <span className="block text-[11px] text-subtle">
                        {result.category.name}
                      </span>
                    </span>
                    <span className="text-sm tabular-nums text-muted">
                      {formatPrice(result.price)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-content">
              {searched ? `No results for “${query.trim()}”` : "Keep typing…"}
            </p>
            {searched ? (
              <p className="mx-auto mt-2 max-w-xs text-xs leading-relaxed text-muted">
                Try a broader term, or browse the full collection to discover
                something unexpected.
              </p>
            ) : null}
          </div>
        )}
      </div>

      {query.trim().length >= 2 ? (
        <button
          type="button"
          onClick={() => submit(query)}
          className="flex w-full items-center justify-between border-t border-line px-5 py-3.5 text-left text-xs text-muted transition-colors hover:bg-white/[0.03] hover:text-content"
        >
          <span>
            Search all results for{" "}
            <span className="font-medium text-content">“{query.trim()}”</span>
          </span>
          <span className="text-accent">Enter ↵</span>
        </button>
      ) : null}
    </Dialog>
  );
}
