import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

type ItemsLogoProps = {
  className?: string;
  compact?: boolean;
};

export function ItemsLogo({ className, compact = false }: ItemsLogoProps) {
  return (
    <Link aria-label="ITEMS home" className={cn("block text-items-blue", className)} href="/">
      <Image
        src="/assets/logo.svg"
        alt="ITEMS"
        width={112}
        height={124}
        priority
        className={cn("h-auto", compact ? "w-[126px] sm:w-[136px]" : "w-[168px]")}
      />
    </Link>
  );
}
