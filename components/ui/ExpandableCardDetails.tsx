import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ExpandableCardDetailsProps = {
  open: boolean;
  children: ReactNode;
  className?: string;
};

export function ExpandableCardDetails({ open, children, className }: ExpandableCardDetailsProps) {
  return (
    <div
      className={cn(
        "grid overflow-hidden transition-[grid-template-rows,margin] duration-300 ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none",
        open ? "mt-3 grid-rows-[1fr]" : "mt-0 grid-rows-[0fr]"
      )}
    >
      <div className="min-h-0 overflow-hidden">
        <div
          aria-hidden={!open}
          className={cn(
            "border-y border-items-blue py-3 transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none",
            open ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0",
            className
          )}
          inert={!open}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
