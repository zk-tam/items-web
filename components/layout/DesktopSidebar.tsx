"use client";

import type { MouseEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { artistMenuItems as fallbackArtistMenuItems, primaryNavigation, type ArtistMenuItem, type PrimaryRoute } from "@/data/navigation";
import { FooterLinks } from "@/components/layout/FooterLinks";
import { ItemsLogo } from "@/components/layout/ItemsLogo";
import { AnimatedPlusMinus } from "@/components/ui/AnimatedPlusMinus";
import { cn } from "@/lib/utils";

type DesktopSidebarProps = {
  activeRoute?: PrimaryRoute;
  artistMenuItems?: ArtistMenuItem[];
  artistMenuExpanded?: boolean;
};

const NAV_ANIMATION_MS = 220;

function shouldUseNativeNavigation(event: MouseEvent<HTMLAnchorElement>) {
  return event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

export function DesktopSidebar({ activeRoute, artistMenuItems = fallbackArtistMenuItems, artistMenuExpanded = false }: DesktopSidebarProps) {
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
    <aside className="hidden min-h-[760px] border-r border-items-blue lg:flex lg:flex-col">
      <div className="flex h-[240px] items-center border-b border-items-blue px-9">
        <ItemsLogo />
      </div>

      <div className="flex flex-1 flex-col px-9 py-8">
        <nav aria-label="Primary navigation" className="space-y-4 text-[13px] font-black leading-none">
          {primaryNavigation.map((item) => {
            const isActive = displayRoute === item.route;
            const isExpandedArtists = item.route === "artists" && (pendingRoute ? pendingRoute === "artists" : artistMenuExpanded);

            return (
              <div key={item.href}>
                <Link
                  className={cn("flex items-center justify-between hover:text-items-blueHover", isActive && "text-items-blue")}
                  href={item.href}
                  onClick={(event) => handleNavClick(item, event)}
                >
                  <span>{item.label}</span>
                  <AnimatedPlusMinus open={isActive || isExpandedArtists} />
                </Link>

                {isExpandedArtists && (
                  <div className="mt-4 space-y-[10px] pl-7 text-[11px] font-bold leading-none">
                    {artistMenuItems.map((artist) => (
                      <Link key={artist.href} href={artist.href} className="block hover:text-items-blueHover">
                        {artist.name}
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
