import { cn } from "@/lib/utils";

type DividerProps = {
  className?: string;
};

export function Divider({ className }: DividerProps) {
  return <div aria-hidden className={cn("h-px w-full bg-items-blue", className)} />;
}
