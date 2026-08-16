import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

type ItemsLogoProps = {
  className?: string;
};

export function ItemsLogo({ className }: ItemsLogoProps) {
  return (
    <Link aria-label="ITEMS home" className={cn("block text-items-blue", className)} href="/">
      <Image
        src="/assets/logo.svg"
        alt="ITEMS"
        width={100}
        height={100}
        priority
      />
    </Link>
  );
}
