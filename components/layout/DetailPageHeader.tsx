"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { primaryNavigation } from "@/data/navigation";
import { UtilityIcons } from "@/components/layout/UtilityIcons";
import { AnimatedPlusMinus } from "@/components/ui/AnimatedPlusMinus";

const detailNavigation = primaryNavigation.filter((item) => item.route !== "shipping");

export function DetailPageHeader() {
  const router = useRouter();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      router.prefetch("/");
      detailNavigation.forEach((item) => router.prefetch(item.href));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [router]);

  return (
    <header className="grid h-[130px] shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-items-blue px-9">
      <Link aria-label="ITEMS home" className="block w-fit" href="/" prefetch>
        <Image src="/assets/logo-horizontal.svg" alt="ITEMS" width={224} height={70} priority className="h-[var(--items-detail-logo-height)] w-auto" />
      </Link>
      <nav aria-label="Primary navigation" className="w-[164px] space-y-3 text-[13px] font-heavy leading-none">
        {detailNavigation.map((item) => (
          <Link key={item.href} href={item.href} className="flex items-center justify-between hover:text-items-blueHover" prefetch>
            {item.label}
            <AnimatedPlusMinus />
          </Link>
        ))}
      </nav>
      <div className="justify-self-end">
        <UtilityIcons stacked className="h-[var(--items-detail-logo-height)]" />
      </div>
    </header>
  );
}
