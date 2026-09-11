"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const START_EVENT = "items:admin-navigation-start";

function isInternalAdminNavigation(event: MouseEvent) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  const target = event.target;
  if (!(target instanceof Element)) return false;
  const link = target.closest<HTMLAnchorElement>("a[href]");
  if (!link || link.target || link.hasAttribute("download")) return false;

  const url = new URL(link.href, window.location.href);
  return url.origin === window.location.origin
    && url.pathname.startsWith("/admin")
    && `${url.pathname}${url.search}` !== `${window.location.pathname}${window.location.search}`;
}

export function AdminNavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const intervalRef = useRef<number | null>(null);
  const completionRef = useRef<number | null>(null);
  const navigatingRef = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const clearTimers = useCallback(() => {
    if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
    if (completionRef.current !== null) window.clearTimeout(completionRef.current);
    intervalRef.current = null;
    completionRef.current = null;
  }, []);

  const start = useCallback(() => {
    clearTimers();
    navigatingRef.current = true;
    setIsLoading(true);
    setProgress((current) => Math.max(current, 12));

    intervalRef.current = window.setInterval(() => {
      setProgress((current) => Math.min(88, current + Math.max(2, (88 - current) * 0.2)));
    }, 220);
  }, [clearTimers]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (isInternalAdminNavigation(event)) start();
    };

    window.addEventListener(START_EVENT, start);
    document.addEventListener("click", handleClick, true);
    return () => {
      window.removeEventListener(START_EVENT, start);
      document.removeEventListener("click", handleClick, true);
    };
  }, [start]);

  useEffect(() => {
    if (!navigatingRef.current) return;
    navigatingRef.current = false;
    if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
    intervalRef.current = null;
    setProgress(100);
    completionRef.current = window.setTimeout(() => {
      setIsLoading(false);
      setProgress(0);
      completionRef.current = null;
    }, 180);
  }, [pathname, searchParams]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  return (
    <div aria-hidden={!isLoading} className={`pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px] transition-opacity duration-150 ${isLoading ? "opacity-100" : "opacity-0"}`}>
      <div className="h-full origin-left bg-items-blue transition-transform duration-200 ease-out" style={{ transform: `scaleX(${progress / 100})` }} />
    </div>
  );
}
