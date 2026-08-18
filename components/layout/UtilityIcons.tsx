import Image from "next/image";
import { CartTrigger } from "@/components/cart/CartDrawer";
import { SearchTrigger } from "@/components/search/SearchDialog";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { itemsInstagramUrl } from "@/data/navigation";
import { cn } from "@/lib/utils";

type UtilityIconsProps = {
  compact?: boolean;
  stacked?: boolean;
  className?: string;
};

export function UtilityIcons({ compact = false, stacked = false, className }: UtilityIconsProps) {
  const useStackedLayout = stacked && !compact;
  const primaryButtons = (
    <>
      <a
        aria-label="Instagram"
        className={cn(
          "inline-flex h-8 w-8 shrink-0 items-center justify-center text-items-blue transition-colors hover:text-items-blueHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-items-blue",
          compact && "h-5 w-5 sm:h-6 sm:w-6"
        )}
        href={itemsInstagramUrl}
        rel="noreferrer"
        target="_blank"
        title="Instagram"
      >
        <Image src="/assets/instagram.svg" alt="" aria-hidden height={26} width={26} className={compact ? "h-4 w-4 sm:h-5 sm:w-5" : "h-5 w-5"} />
      </a>
      <SearchTrigger className={useStackedLayout ? "h-6 w-6" : compact ? "h-5 w-5 sm:h-6 sm:w-6" : undefined}>
        <Image src="/assets/search.svg" alt="" aria-hidden height={26} width={26} className={compact ? "h-4 w-4 sm:h-5 sm:w-5" : "h-5 w-5"} />
      </SearchTrigger>
      <CartTrigger className={useStackedLayout ? "h-6 w-6" : compact ? "h-5 w-5 sm:h-6 sm:w-6" : undefined}>
        <Image src="/assets/cart.svg" alt="" aria-hidden height={26} width={26} className={compact ? "h-[18px] w-[18px] sm:h-[22px] sm:w-[22px]" : "h-5 w-5"} />
      </CartTrigger>
    </>
  );

  if (useStackedLayout) {
    return (
      <div className={cn("flex flex-col items-end justify-between pb-4", className)}>
        <div className="grid grid-cols-[32px_24px_24px] items-center gap-x-2">
          {primaryButtons}
        </div>
        <ThemeToggle compact={compact} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center",
        compact && "gap-1.5 sm:gap-2",
        !compact && "gap-3",
        className
      )}
    >
      {primaryButtons}
      <ThemeToggle compact={compact} />
    </div>
  );
}
