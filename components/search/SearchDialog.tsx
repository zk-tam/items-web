"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { IconButton } from "@/components/ui/IconButton";
import type { CatalogSearchResult } from "@/lib/search/catalog-search";

type SearchContextValue = {
  openSearch: () => void;
};

const SearchContext = createContext<SearchContextValue | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
  }, []);

  const openSearch = useCallback(() => {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    setIsRendered(true);
    window.requestAnimationFrame(() => setIsOpen(true));
  }, []);

  const closeSearch = useCallback(() => {
    setIsOpen(false);
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      setIsRendered(false);
      closeTimerRef.current = null;
    }, 260);
  }, []);

  return (
    <SearchContext.Provider value={{ openSearch }}>
      {children}
      {isRendered && <SearchDialog isOpen={isOpen} onClose={closeSearch} />}
    </SearchContext.Provider>
  );
}

export function SearchTrigger({ className, children }: { className?: string; children: ReactNode }) {
  const context = useContext(SearchContext);

  if (!context) {
    throw new Error("SearchTrigger must be used inside SearchProvider");
  }

  return (
    <IconButton label="Search" className={className} onClick={context.openSearch}>
      {children}
    </IconButton>
  );
}

function SearchDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CatalogSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() => inputRef.current?.focus());

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    const searchQuery = query.trim();
    if (!isOpen || !searchQuery) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`, {
          signal: controller.signal,
          cache: "no-store"
        });

        if (!response.ok) throw new Error("Search unavailable");
        const payload: { results?: CatalogSearchResult[] } = await response.json();
        setResults(payload.results ?? []);
      } catch (caughtError) {
        if ((caughtError as Error).name !== "AbortError") {
          setResults([]);
          setError("Search is temporarily unavailable.");
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, 140);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [isOpen, query]);

  const trimmedQuery = query.trim();

  function handleQueryChange(nextQuery: string) {
    setQuery(nextQuery);
    if (nextQuery.trim()) return;

    setResults([]);
    setIsLoading(false);
    setError(null);
  }

  return (
    <div
      aria-hidden={!isOpen}
      className={`items-search-backdrop fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto px-5 py-[12vh] transition-[opacity,backdrop-filter] duration-[260ms] ease-out sm:items-center sm:py-8 ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
      onMouseDown={onClose}
    >
      <section
        aria-label="Search artists and items"
        aria-modal="true"
        className={`w-full max-w-2xl overflow-hidden border border-items-blue bg-[var(--items-surface)] shadow-[0_18px_54px_rgba(0,87,255,0.18)] transition-[opacity,transform] duration-[260ms] ease-[cubic-bezier(.2,.85,.25,1)] ${isOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-3 scale-[0.98] opacity-0"}`}
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex h-[52px] items-center gap-3 border-b border-items-blue px-4 py-3 sm:px-5">
          <Image src="/assets/search.svg" alt="" aria-hidden width={22} height={22} className="h-[18px] w-[18px] shrink-0" />
          <input
            ref={inputRef}
            aria-label="Search artists and items"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent text-base font-medium text-items-blue outline-none placeholder:text-items-blue/55 sm:text-lg"
            onChange={(event) => handleQueryChange(event.target.value)}
            placeholder="Search artists and items"
            type="text"
            value={query}
          />
          {trimmedQuery && (
            <button
              aria-label="Clear search"
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center text-2xl font-medium leading-none transition-colors hover:text-items-blueHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-items-blue"
              onClick={() => handleQueryChange("")}
              type="button"
            >
              ×
            </button>
          )}
        </div>

        <div className="max-h-[min(58vh,520px)] overflow-y-auto p-2 sm:p-3">
          {!trimmedQuery && <p className="px-3 py-8 text-center text-sm font-medium text-items-blue opacity-70">Start typing to search artists and items.</p>}
          {trimmedQuery && isLoading && <p className="px-3 py-8 text-center text-sm font-medium text-items-blue opacity-70">Searching…</p>}
          {trimmedQuery && !isLoading && error && <p className="px-3 py-8 text-center text-sm font-medium">{error}</p>}
          {trimmedQuery && !isLoading && !error && results.length === 0 && <p className="px-3 py-8 text-center text-sm font-medium text-items-blue opacity-70">No artists or items match “{trimmedQuery}”.</p>}
          {trimmedQuery && !isLoading && !error && results.map((result) => (
            <Link
              key={`${result.type}-${result.id}`}
              className="grid grid-cols-[62px_minmax(0,1fr)] gap-3 p-2 transition-colors hover:bg-items-blue hover:text-items-white focus-visible:bg-items-blue focus-visible:text-items-white focus-visible:outline-none sm:grid-cols-[72px_minmax(0,1fr)]"
              href={result.href}
              onClick={onClose}
              prefetch
            >
              <div className="relative aspect-square overflow-hidden rounded-item bg-items-placeholder">
                {result.thumbnail ? (
                  <Image src={result.thumbnail} alt={result.thumbnailAlt} fill sizes="72px" className="object-cover" />
                ) : (
                  <span className="flex h-full items-center justify-center px-2 text-center text-[10px] font-black uppercase text-items-blue opacity-70">{result.type}</span>
                )}
              </div>
              <div className="min-w-0 self-center">
                <p className="text-[10px] font-black uppercase tracking-[0.08em]">{result.type}</p>
                <p className="mt-1 truncate text-sm font-heavy sm:text-base">{result.name}</p>
                <p className="mt-1 overflow-hidden text-xs font-medium leading-snug [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] sm:text-sm">{result.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
