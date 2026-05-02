import { Instagram, Search, ShoppingCart } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { cn } from "@/lib/utils";

type UtilityIconsProps = {
  compact?: boolean;
};

export function UtilityIcons({ compact = false }: UtilityIconsProps) {
  return (
    <div className={cn("flex items-center", compact ? "gap-1.5 sm:gap-2" : "gap-3")}>
      <IconButton label="Instagram" className={compact ? "h-5 w-5 sm:h-6 sm:w-6" : undefined}>
        <Instagram className={compact ? "h-3.5 w-3.5 sm:h-4 sm:w-4" : "h-5 w-5"} strokeWidth={1.9} />
      </IconButton>
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
