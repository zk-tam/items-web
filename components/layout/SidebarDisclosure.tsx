"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export const SIDEBAR_DISCLOSURE_ROUTE_KEY = "items-sidebar-disclosure-route";

type SidebarDisclosureProps = {
  route: string;
  open: boolean;
  children: ReactNode;
};

export function SidebarDisclosure({ route, open, children }: SidebarDisclosureProps) {
  const disclosureRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const disclosure = disclosureRef.current;
    const content = contentRef.current;
    if (!open || !disclosure || !content || window.sessionStorage.getItem(SIDEBAR_DISCLOSURE_ROUTE_KEY) !== route) return;

    // A route change can mount this sidebar in its final open state. Force a
    // closed state before paint, then release it on the next frame so the
    // browser has an actual start and end value to interpolate.
    window.sessionStorage.removeItem(SIDEBAR_DISCLOSURE_ROUTE_KEY);
    disclosure.style.transition = "none";
    disclosure.style.gridTemplateRows = "0fr";
    disclosure.style.marginTop = "0";
    content.style.transition = "none";
    content.style.opacity = "0";
    content.style.transform = "translateY(-0.25rem)";

    const animationFrame = window.requestAnimationFrame(() => {
      disclosure.style.removeProperty("transition");
      disclosure.style.removeProperty("grid-template-rows");
      disclosure.style.removeProperty("margin-top");
      content.style.removeProperty("transition");
      content.style.removeProperty("opacity");
      content.style.removeProperty("transform");
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);
      disclosure.style.removeProperty("transition");
      disclosure.style.removeProperty("grid-template-rows");
      disclosure.style.removeProperty("margin-top");
      content.style.removeProperty("transition");
      content.style.removeProperty("opacity");
      content.style.removeProperty("transform");
    };
  }, [open, route]);

  return (
    <div ref={disclosureRef} className={cn("items-sidebar-disclosure", open && "items-sidebar-disclosure-open")}>
      <div className="min-h-0 overflow-hidden">
        <div ref={contentRef} className="min-h-0" aria-hidden={!open} inert={!open}>
          {children}
        </div>
      </div>
    </div>
  );
}
