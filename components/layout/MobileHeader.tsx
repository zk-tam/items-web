"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { primaryNavigation, type PrimaryRoute } from "@/data/navigation";
import { ItemsLogo } from "@/components/layout/ItemsLogo";
import { UtilityIcons } from "@/components/layout/UtilityIcons";
import { AnimatedPlusMinus } from "@/components/ui/AnimatedPlusMinus";

type MobileHeaderProps = {
  activeRoute?: PrimaryRoute;
};

export function MobileHeader({ activeRoute }: MobileHeaderProps) {
  const router = useRouter();
  const [pendingRoute, setPendingRoute] = useState<PrimaryRoute | null>(null);
  const displayRoute = pendingRoute ?? activeRoute;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      primaryNavigation.forEach((item) => router.prefetch(item.href));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [router]);

  function handleNavClick(item: (typeof primaryNavigation)[number]) {
    if (item.route === displayRoute) return;
    setPendingRoute(item.route);
  }

  return (
    <header className="overflow-hidden lg:hidden">
      <div className="px-7 py-4">
        <div className="relative min-h-[150px]">
          <ItemsLogo className="absolute left-0 top-8 max-w-[150px] sm:max-w-[160px]" />
          <div className="absolute right-0 top-0">
            <UtilityIcons compact />
          </div>
          <nav
            aria-label="Primary navigation"
            className="absolute right-0 top-[82px] w-[156px] space-y-4 text-right text-[13px] font-black leading-none sm:top-[86px] sm:w-[168px] sm:space-y-5 sm:text-[14px]"
          >
            {primaryNavigation.map((item) => (
              <Link
                key={item.href}
                className="flex items-start justify-end gap-2 hover:text-items-blueHover"
                href={item.href}
                onClick={() => handleNavClick(item)}
                prefetch
              >
                <span className="max-w-[138px] sm:max-w-[150px]">{item.label}</span>
                <AnimatedPlusMinus className="mt-px min-w-3" open={displayRoute === item.route} />
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <div className="mx-7 h-px bg-items-blue" />
    </header>
  );
}
