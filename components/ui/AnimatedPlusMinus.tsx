import { cn } from "@/lib/utils";

type AnimatedPlusMinusProps = {
  open?: boolean;
  className?: string;
};

export function AnimatedPlusMinus({ open = false, className }: AnimatedPlusMinusProps) {
  return (
    <svg
      aria-hidden="true"
      className={cn("h-3 w-3 overflow-visible text-current", className)}
      focusable="false"
      viewBox="0 0 16 16"
    >
      <line
        x1="3"
        x2="13"
        y1="8"
        y2="8"
        stroke="currentColor"
        strokeLinecap="square"
        strokeWidth="1.8"
      />
      <line
        className={cn(
          "origin-center transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none",
          open ? "scale-y-0 opacity-0" : "scale-y-100 opacity-100"
        )}
        style={{ transformBox: "fill-box" }}
        x1="8"
        x2="8"
        y1="3"
        y2="13"
        stroke="currentColor"
        strokeLinecap="square"
        strokeWidth="1.8"
      />
    </svg>
  );
}
