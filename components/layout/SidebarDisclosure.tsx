"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SidebarDisclosureProps = {
  open: boolean;
  children: ReactNode;
};

export function SidebarDisclosure({ open, children }: SidebarDisclosureProps) {
  return (
    <div className={cn("items-sidebar-disclosure", open && "items-sidebar-disclosure-open")}>
      <div className="min-h-0 overflow-hidden">
        <div className="min-h-0" aria-hidden={!open} inert={!open}>
          {children}
        </div>
      </div>
    </div>
  );
}
