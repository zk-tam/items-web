"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { primaryNavigation, type ArtistMenuItem, type NavigationItem, type PrimaryRoute, type ProductMenuItem } from "@/data/navigation";
import { FooterLinks } from "@/components/layout/FooterLinks";
import { ItemsLogo } from "@/components/layout/ItemsLogo";
import { SidebarContactActions } from "@/components/layout/SidebarContactActions";
import { SidebarDisclosure, SIDEBAR_DISCLOSURE_ROUTE_KEY } from "@/components/layout/SidebarDisclosure";
import { AnimatedPlusMinus } from "@/components/ui/AnimatedPlusMinus";
import { cn } from "@/lib/utils";

type DesktopSidebarProps = {
  activeRoute?: PrimaryRoute;
  navigation?: NavigationItem[];
  artistMenuItems?: ArtistMenuItem[];
  artistMenuExpanded?: boolean;
  productMenuItems?: ProductMenuItem[];
  productMenuExpanded?: boolean;
  viewportLocked?: boolean;
};

export function DesktopSidebar({
  activeRoute,
  navigation = primaryNavigation,
  artistMenuItems = [],
  artistMenuExpanded = false,
  productMenuItems = [],
  productMenuExpanded = false,
  viewportLocked = false
}: DesktopSidebarProps) {
  const router = useRouter();
  const [pendingRoute, setPendingRoute] = useState<PrimaryRoute | null>(null);
  const displayRoute = pendingRoute ?? activeRoute;
  const isExpandedProducts = displayRoute === "shop" && (pendingRoute ? pendingRoute === "shop" : productMenuExpanded);
  const isExpandedArtists = displayRoute === "artists" && (pendingRoute ? pendingRoute === "artists" : artistMenuExpanded);
  useEffect(() => {
    const routes = new Set([
      ...navigation.map((item) => item.href),
      ...productMenuItems.map((item) => item.href),
      ...artistMenuItems.map((item) => item.href)
    ]);
    const timer = window.setTimeout(() => {
      routes.forEach((href) => router.prefetch(href));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [artistMenuItems, navigation, productMenuItems, router]);

  function handleNavClick(item: NavigationItem) {
    if (item.route === displayRoute) return;
    if (item.route === "shop" || item.route === "artists") {
      window.sessionStorage.setItem(SIDEBAR_DISCLOSURE_ROUTE_KEY, item.route);
      window.setTimeout(() => window.sessionStorage.removeItem(SIDEBAR_DISCLOSURE_ROUTE_KEY), 1000);
    }
    setPendingRoute(item.route);
  }

  return (
    <aside className={cn("relative hidden lg:flex lg:flex-col", viewportLocked ? "h-full min-h-0" : "sticky top-6 h-[calc(100dvh-48px)] min-h-0 self-start")}>
      <div className="relative flex h-[var(--items-header-height)] shrink-0 items-center px-8">
        <ItemsLogo className="self-start" imageClassName="w-[165px]" />
        <div aria-hidden className="absolute bottom-0 left-8 right-0 h-px bg-items-blue" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-8 pb-9 pt-8">
        <nav aria-label="Primary navigation" className="shrink-0 space-y-4 text-[13px] font-black leading-none">
          {navigation.map((item) => {
            const isActive = displayRoute === item.route;
            const isProductMenu = item.route === "shop";
            const isArtistMenu = item.route === "artists";
            const menuItems = isProductMenu ? productMenuItems : isArtistMenu ? artistMenuItems : [];
            const isExpanded = isProductMenu ? isExpandedProducts : isArtistMenu && isExpandedArtists;

            return (
              <div key={item.href}>
                <Link
                  className={cn("flex items-center justify-between hover:text-items-blueHover", isActive && "text-items-blue")}
                  href={item.href}
                  onClick={() => handleNavClick(item)}
                  prefetch
                >
                  <span>{item.label}</span>
                  <AnimatedPlusMinus open={isActive || isExpanded} />
                </Link>
                {(isProductMenu || isArtistMenu) && (
                  <SidebarDisclosure route={item.route} open={isExpanded}>
                    <div className="space-y-[10px] pl-7 text-[11px] font-bold leading-none">
                      {menuItems.map((menuItem) => (
                        <Link key={menuItem.href} href={menuItem.href} className="block hover:text-items-blueHover" onFocus={() => router.prefetch(menuItem.href)} onMouseEnter={() => router.prefetch(menuItem.href)} prefetch>
                          {menuItem.name}
                        </Link>
                      ))}
                    </div>
                  </SidebarDisclosure>
                )}
              </div>
            );
          })}
        </nav>

        <div className="mt-auto shrink-0 pt-8">
          <FooterLinks hideInstagram hideShipping afterPrivacy={<SidebarContactActions />} />
        </div>
      </div>
      <div aria-hidden className="items-sidebar-divider absolute bottom-9 right-0 w-px bg-items-blue" />
    </aside>
  );
}
