import { Instagram, Search, ShoppingCart } from "lucide-react";
import { itemsInstagramUrl } from "@/data/navigation";
import { IconButton } from "@/components/ui/IconButton";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { cn } from "@/lib/utils";

type UtilityIconsProps = {
  compact?: boolean;
};

export function UtilityIcons({ compact = false }: UtilityIconsProps) {
  return (
    <div className={cn("flex items-center", compact ? "gap-1.5 sm:gap-2" : "gap-3")}>
      <a
        aria-label="Instagram"
        className={cn("inline-flex shrink-0 items-center justify-center text-items-blue transition-colors hover:text-items-blueHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-items-blue", compact ? "h-5 w-5 sm:h-6 sm:w-6" : "h-8 w-8")}
        href={itemsInstagramUrl}
        rel="noopener noreferrer"
        target="_blank"
        title="Instagram"
      >
        <Instagram className={compact ? "h-3.5 w-3.5 sm:h-4 sm:w-4" : "h-5 w-5"} strokeWidth={1.9} />
      </a>
      <IconButton label="Search" className={compact ? "h-5 w-5 sm:h-6 sm:w-6" : undefined}>
        <Search className={compact ? "h-4 w-4 sm:h-5 sm:w-5" : "h-6 w-6"} strokeWidth={1.8} />
      </IconButton>
      <IconButton label="Cart" className={compact ? "h-5 w-5 sm:h-6 sm:w-6" : undefined}>
        <ShoppingCart className={compact ? "h-3.5 w-3.5 sm:h-4 sm:w-4" : "h-5 w-5"} strokeWidth={1.9} />
      </IconButton>
      <ThemeToggle compact={compact} />
    </div>
  );
}
