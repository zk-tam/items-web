import Link from "next/link";
import Image from "next/image";
import { primaryNavigation } from "@/data/navigation";
import { UtilityIcons } from "@/components/layout/UtilityIcons";
import { AnimatedPlusMinus } from "@/components/ui/AnimatedPlusMinus";

const detailNavigation = primaryNavigation.filter((item) => item.route !== "shipping");

export function DetailPageHeader() {
  return (
    <header className="grid h-[130px] shrink-0 grid-cols-[1fr_auto_1fr] items-start border-b border-items-blue px-9 py-8">
      <Link aria-label="ITEMS home" className="block w-fit" href="/">
        <Image src="/assets/logo-horizontal.svg" alt="ITEMS" width={224} height={70} priority className="h-auto w-[224px]" />
      </Link>
      <nav aria-label="Primary navigation" className="w-[164px] space-y-3 text-[13px] font-heavy leading-none">
        {detailNavigation.map((item) => (
          <Link key={item.href} href={item.href} className="flex items-center justify-between hover:text-items-blueHover">
            {item.label}
            <AnimatedPlusMinus />
          </Link>
        ))}
      </nav>
      <div className="justify-self-end">
        <UtilityIcons />
      </div>
    </header>
  );
}
