"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { primaryNavigation } from "@/data/navigation";
import { UtilityIcons } from "@/components/layout/UtilityIcons";
import { AnimatedPlusMinus } from "@/components/ui/AnimatedPlusMinus";

const detailNavigation = primaryNavigation;

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
    <header className="relative h-[var(--items-detail-header-height)] shrink-0 px-9">
      <Link aria-label="ITEMS home" className="absolute left-9 top-1/2 block w-fit -translate-y-1/2" href="/" prefetch>
        <Image src="/assets/logo-horizontal.svg" alt="ITEMS" width={224} height={70} priority className="h-[var(--items-detail-logo-height)] w-auto" />
      </Link>
      <nav aria-label="Primary navigation" className="absolute left-1/2 top-1/2 w-[164px] -translate-y-1/2 space-y-3 text-[13px] font-heavy leading-none">
        {detailNavigation.map((item) => (
          <Link key={item.href} href={item.href} className="flex items-center justify-between hover:text-items-blueHover" prefetch>
            {item.label}
            <AnimatedPlusMinus />
          </Link>
        ))}
      </nav>
      <div className="absolute inset-y-0 right-9 flex flex-col justify-end">
        <UtilityIcons stacked className="h-[var(--items-detail-header-controls-height)]" />
      </div>
      <div aria-hidden className="absolute bottom-0 left-8 right-8 h-px bg-items-blue" />
    </header>
  );
}
