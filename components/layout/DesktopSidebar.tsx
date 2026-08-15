"use client";

import type { MouseEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { primaryNavigation, type ArtistMenuItem, type PrimaryRoute, type ProductMenuItem } from "@/data/navigation";
import { FooterLinks } from "@/components/layout/FooterLinks";
import { ItemsLogo } from "@/components/layout/ItemsLogo";
import { AnimatedPlusMinus } from "@/components/ui/AnimatedPlusMinus";
import { cn } from "@/lib/utils";

type DesktopSidebarProps = {
  activeRoute?: PrimaryRoute;
  artistMenuItems?: ArtistMenuItem[];
  artistMenuExpanded?: boolean;
  productMenuItems?: ProductMenuItem[];
  productMenuExpanded?: boolean;
  viewportLocked?: boolean;
};

const NAV_ANIMATION_MS = 220;

function shouldUseNativeNavigation(event: MouseEvent<HTMLAnchorElement>) {
  return event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

export function DesktopSidebar({
  activeRoute,
  artistMenuItems = [],
  artistMenuExpanded = false,
  productMenuItems = [],
  productMenuExpanded = false,
  viewportLocked = false
}: DesktopSidebarProps) {
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
    <aside className={cn("hidden border-r border-items-blue lg:flex lg:flex-col", viewportLocked ? "h-full min-h-0" : "min-h-[760px]")}>
      <div className="flex h-[240px] shrink-0 items-center border-b border-items-blue px-9">
        <ItemsLogo />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-9 py-8">
        <nav aria-label="Primary navigation" className="space-y-4 text-[13px] font-black leading-none">
          {primaryNavigation.map((item) => {
            const isActive = displayRoute === item.route;
            const isExpandedProducts = item.route === "shop" && (pendingRoute ? pendingRoute === "shop" : productMenuExpanded);
            const isExpandedArtists = item.route === "artists" && (pendingRoute ? pendingRoute === "artists" : artistMenuExpanded);
            const menuItems = item.route === "shop" ? productMenuItems : artistMenuItems;
            const isExpanded = isExpandedProducts || isExpandedArtists;

            return (
              <div key={item.href}>
                <Link
                  className={cn("flex items-center justify-between hover:text-items-blueHover", isActive && "text-items-blue")}
                  href={item.href}
                  onClick={(event) => handleNavClick(item, event)}
                >
                  <span>{item.label}</span>
                  <AnimatedPlusMinus open={isActive || isExpanded} />
                </Link>

                {isExpanded && (
                  <div className="mt-4 space-y-[10px] pl-7 text-[11px] font-bold leading-none">
                    {menuItems.map((menuItem) => (
                      <Link key={menuItem.href} href={menuItem.href} className="block hover:text-items-blueHover">
                        {menuItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="mt-auto pt-10">
          <FooterLinks />
        </div>
      </div>
    </aside>
  );
}
