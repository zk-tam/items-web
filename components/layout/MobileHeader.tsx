"use client";

import type { MouseEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { primaryNavigation, type PrimaryRoute } from "@/data/navigation";
import { ItemsLogo } from "@/components/layout/ItemsLogo";
import { UtilityIcons } from "@/components/layout/UtilityIcons";
import { AnimatedPlusMinus } from "@/components/ui/AnimatedPlusMinus";

type MobileHeaderProps = {
  activeRoute?: PrimaryRoute;
};

const NAV_ANIMATION_MS = 220;

function shouldUseNativeNavigation(event: MouseEvent<HTMLAnchorElement>) {
  return event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

export function MobileHeader({ activeRoute }: MobileHeaderProps) {
  const router = useRouter();
  const [pendingRoute, setPendingRoute] = useState<PrimaryRoute | null>(null);
  const displayRoute = pendingRoute ?? activeRoute;

  function handleNavClick(item: (typeof primaryNavigation)[number], event: MouseEvent<HTMLAnchorElement>) {
    if (shouldUseNativeNavigation(event) || item.route === displayRoute) {
      return;
    }

    event.preventDefault();
    setPendingRoute(item.route);
    window.setTimeout(() => {
      router.push(item.href);
    }, NAV_ANIMATION_MS);
  }

  return (
    <header className="overflow-hidden lg:hidden">
      <div className="px-7 pb-6 pt-8">
        <div className="relative min-h-[206px] sm:min-h-[214px]">
          <ItemsLogo compact className="absolute left-0 top-8 max-w-[150px] sm:max-w-[160px]" />
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
                onClick={(event) => handleNavClick(item, event)}
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
