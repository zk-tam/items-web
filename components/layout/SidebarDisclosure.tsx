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

  useLayoutEffect(() => {
    const disclosure = disclosureRef.current;
    const shouldAnimateOpen = open && window.sessionStorage.getItem(SIDEBAR_DISCLOSURE_ROUTE_KEY) === route;

    if (!shouldAnimateOpen) {
      disclosure?.removeAttribute("data-opening");
      return;
    }

    // Route transitions can preserve this client component and coalesce
    // inline style changes into a single paint. Keep the disclosure closed
    // for one rendered frame, then open it on the following frame so every
    // navigation has a reliable transition start and end state.
    window.sessionStorage.removeItem(SIDEBAR_DISCLOSURE_ROUTE_KEY);
    disclosure?.setAttribute("data-opening", "true");
    void disclosure?.offsetHeight;

    let openFrame: number | null = null;
    const closedFrame = window.requestAnimationFrame(() => {
      openFrame = window.requestAnimationFrame(() => {
        disclosure?.removeAttribute("data-opening");
      });
    });

    return () => {
      window.cancelAnimationFrame(closedFrame);
      if (openFrame !== null) window.cancelAnimationFrame(openFrame);
      disclosure?.removeAttribute("data-opening");
    };
  }, [open, route]);

  return (
    <div ref={disclosureRef} className={cn("items-sidebar-disclosure", open && "items-sidebar-disclosure-open")}>
      <div className="min-h-0 overflow-hidden">
        <div className="min-h-0" aria-hidden={!open} inert={!open}>
          {children}
        </div>
      </div>
    </div>
  );
}
