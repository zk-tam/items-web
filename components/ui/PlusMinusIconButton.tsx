import type { ButtonHTMLAttributes } from "react";
import { AnimatedPlusMinus } from "@/components/ui/AnimatedPlusMinus";
import { cn } from "@/lib/utils";

type PlusMinusIconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  open?: boolean;
  label: string;
  iconClassName?: string;
};

export function PlusMinusIconButton({
  open = false,
  label,
  className,
  iconClassName,
  ...props
}: PlusMinusIconButtonProps) {
  return (
    <button
      aria-expanded={open}
      aria-label={label}
      className={cn(
        "inline-flex h-6 w-6 shrink-0 items-center justify-center text-items-blue transition-colors hover:text-items-blueHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-items-blue lg:h-4 lg:w-4",
        className
      )}
      type="button"
      {...props}
    >
      <AnimatedPlusMinus className={cn("h-4 w-4 lg:h-3 lg:w-3", iconClassName)} open={open} />
    </button>
  );
}
