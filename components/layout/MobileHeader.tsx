"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { primaryNavigation, type NavigationItem, type PrimaryRoute } from "@/data/navigation";
import { ItemsLogo } from "@/components/layout/ItemsLogo";
import { UtilityIcons } from "@/components/layout/UtilityIcons";
import { AnimatedPlusMinus } from "@/components/ui/AnimatedPlusMinus";

type MobileHeaderProps = {
  activeRoute?: PrimaryRoute;
  navigation?: NavigationItem[];
};

export function MobileHeader({ activeRoute, navigation = primaryNavigation }: MobileHeaderProps) {
  const router = useRouter();
  const [pendingRoute, setPendingRoute] = useState<PrimaryRoute | null>(null);
  const displayRoute = pendingRoute ?? activeRoute;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      navigation.forEach((item) => router.prefetch(item.href));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [navigation, router]);

  function handleNavClick(item: NavigationItem) {
    if (item.route === displayRoute) return;
    setPendingRoute(item.route);
  }

  return (
    <header className="overflow-hidden lg:hidden">
      <div className="px-7 py-4">
        <div className="grid min-h-[198px] grid-cols-[minmax(0,1fr)_auto] gap-x-3 sm:min-h-[218px] sm:gap-x-4">
          <ItemsLogo className="self-center" imageClassName="h-auto w-[171px] max-w-full" />
          <div className="flex flex-col items-end">
            <UtilityIcons compact />
            <nav
              aria-label="Primary navigation"
              className="mt-[66px] w-[156px] space-y-[14px] text-right text-[13px] font-black leading-none max-[375px]:space-y-3 max-[375px]:text-[12px] max-[359px]:space-y-1.5 max-[359px]:text-[10px] sm:mt-[70px] sm:w-[168px] sm:space-y-[15px] sm:text-[14px]"
            >
              {navigation.map((item) => (
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
      </div>
      <div className="mx-7 h-px bg-items-blue" />
    </header>
  );
}
