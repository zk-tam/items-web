"use client";

import type { ReactNode, TransitionEvent } from "react";
import { cn } from "@/lib/utils";

type SidebarDisclosureProps = {
  id?: string;
  open: boolean;
  onCollapseComplete?: () => void;
  children: ReactNode;
};

export function SidebarDisclosure({ id, open, onCollapseComplete, children }: SidebarDisclosureProps) {
  function handleTransitionEnd(event: TransitionEvent<HTMLDivElement>) {
    if (open || event.target !== event.currentTarget || event.propertyName !== "grid-template-rows") return;
    onCollapseComplete?.();
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
