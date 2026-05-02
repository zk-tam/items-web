import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

type IconButtonProps = ComponentPropsWithoutRef<"button"> & {
  label: string;
  children: ReactNode;
};

export function IconButton({ label, children, className, ...props }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-8 w-8 shrink-0 items-center justify-center text-items-blue transition-colors hover:text-items-blueHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-items-blue",
        className
      )}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
