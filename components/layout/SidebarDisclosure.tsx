"use client";

import type { ReactNode, TransitionEvent } from "react";
import { cn } from "@/lib/utils";

type SidebarDisclosureProps = {
  id?: string;
  open: boolean;
  onTransitionComplete?: () => void;
  children: ReactNode;
};

export function SidebarDisclosure({ id, open, onTransitionComplete, children }: SidebarDisclosureProps) {
  function handleTransitionEnd(event: TransitionEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget || event.propertyName !== "grid-template-rows") return;
    onTransitionComplete?.();
  }

  return (
    <div id={id} className={cn("items-sidebar-disclosure", open && "items-sidebar-disclosure-open")} onTransitionEnd={handleTransitionEnd}>
      <div className="min-h-0 overflow-hidden">
        <div className="min-h-0" aria-hidden={!open} inert={!open}>
          {children}
        </div>
      </div>
    </div>
  );
}
