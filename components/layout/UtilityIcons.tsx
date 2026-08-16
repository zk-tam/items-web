import Image from "next/image";
import { IconButton } from "@/components/ui/IconButton";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { cn } from "@/lib/utils";

type UtilityIconsProps = {
  compact?: boolean;
  stacked?: boolean;
  className?: string;
};

export function UtilityIcons({ compact = false, stacked = false, className }: UtilityIconsProps) {
  const useStackedLayout = stacked && !compact;

  return (
    <div
      className={cn(
        useStackedLayout ? "grid grid-cols-2 grid-rows-[auto_1fr_auto] gap-x-3" : "flex items-center",
        compact && "gap-1.5 sm:gap-2",
        !compact && !useStackedLayout && "gap-3",
        className
      )}
    >
      <IconButton label="Search" className={compact ? "h-5 w-5 sm:h-6 sm:w-6" : undefined}>
        <Image src="/assets/search.svg" alt="" aria-hidden height={26} width={26} className={compact ? "h-4 w-4 sm:h-5 sm:w-5" : "h-5 w-5"} />
      </IconButton>
      <IconButton label="Cart" className={compact ? "h-5 w-5 sm:h-6 sm:w-6" : undefined}>
        <Image src="/assets/cart.svg" alt="" aria-hidden height={26} width={26} className={compact ? "h-3.5 w-3.5 sm:h-4 sm:w-4" : "h-5 w-5"} />
      </IconButton>
      {useStackedLayout ? (
        <div className="col-span-2 row-start-3 flex justify-end">
          <ThemeToggle compact={compact} />
        </div>
      ) : (
        <ThemeToggle compact={compact} />
      )}
    </div>
  );
}
