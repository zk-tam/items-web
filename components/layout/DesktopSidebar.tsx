"use client";

import { useEffect, useState, type MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { primaryNavigation, type ArtistMenuItem, type NavigationItem, type PrimaryRoute, type ProductMenuItem } from "@/data/navigation";
import { FooterLinks } from "@/components/layout/FooterLinks";
import { ItemsLogo } from "@/components/layout/ItemsLogo";
import { SidebarContactActions } from "@/components/layout/SidebarContactActions";
import { SidebarDisclosure } from "@/components/layout/SidebarDisclosure";
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

type DisclosureRoute = "shop" | "artists";
type PendingNavigation = {
  href: string;
  transitionRoute: DisclosureRoute;
};

function isDisclosureRoute(route: PrimaryRoute): route is DisclosureRoute {
  return route === "shop" || route === "artists";
}

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
  const [disclosureRoute, setDisclosureRoute] = useState<DisclosureRoute | null | undefined>(undefined);
  const [pendingNavigation, setPendingNavigation] = useState<PendingNavigation | null>(null);
  const displayRoute = pendingRoute ?? activeRoute;
  const serverDisclosureRoute: DisclosureRoute | null = productMenuExpanded ? "shop" : artistMenuExpanded ? "artists" : null;
  const expandedRoute = disclosureRoute === undefined ? serverDisclosureRoute : disclosureRoute;
  const isExpandedProducts = expandedRoute === "shop";
  const isExpandedArtists = expandedRoute === "artists";
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

  function handleNavClick(event: MouseEvent<HTMLAnchorElement>, item: NavigationItem) {
    setPendingRoute(item.route);
    setPendingNavigation(null);
    if (!expandedRoute) return;

    event.preventDefault();
    setDisclosureRoute(null);
    navigateAfterDisclosureTransition(item.href, expandedRoute);
  }

  function hasMenuItems(route: DisclosureRoute) {
    return route === "shop" ? productMenuItems.length > 0 : artistMenuItems.length > 0;
  }

  function navigateAfterDisclosureTransition(href: string, transitionRoute: DisclosureRoute) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !hasMenuItems(transitionRoute)) {
      router.push(href);
      return;
    }

    setPendingNavigation({ href, transitionRoute });
  }

  function handleDisclosureClick(event: MouseEvent<HTMLAnchorElement>, item: NavigationItem, route: DisclosureRoute) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const currentlyOpen = expandedRoute === route;
    setPendingRoute(route);
    setPendingNavigation(null);
    setDisclosureRoute(currentlyOpen ? null : route);
    event.preventDefault();
    if (displayRoute === route) return;

    navigateAfterDisclosureTransition(item.href, route);
  }

  function handleDisclosureTransitionComplete(route: DisclosureRoute) {
    if (!pendingNavigation || pendingNavigation.transitionRoute !== route) return;
    setPendingNavigation(null);
    router.push(pendingNavigation.href);
  }

  return (
    <aside className={cn("relative hidden lg:flex lg:flex-col", viewportLocked ? "h-full min-h-0" : "sticky top-6 h-[calc(100dvh-48px)] min-h-0 self-start")}>
      <div className="relative flex h-[var(--items-header-height)] shrink-0 items-center px-8">
        <ItemsLogo className="self-start" imageClassName="w-[165px]" />
        <div aria-hidden className="absolute bottom-0 left-8 right-0 h-px bg-items-blue" />
      </div>

      <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_auto] overflow-hidden px-8 pt-8">
        <nav aria-label="Primary navigation" className="items-sidebar-navigation min-h-0 space-y-4 overflow-hidden text-[13px] font-black leading-none">
          {navigation.map((item) => {
            const isActive = displayRoute === item.route;
            const disclosureRoute = isDisclosureRoute(item.route) ? item.route : null;
            const isDisclosure = disclosureRoute !== null;
            const menuItems = item.route === "shop" ? productMenuItems : item.route === "artists" ? artistMenuItems : [];
            const isExpanded = item.route === "shop" ? isExpandedProducts : item.route === "artists" && isExpandedArtists;

            return (
              <div key={item.href}>
                {isDisclosure ? (
                  <Link
                    aria-controls={`${item.route}-sidebar-disclosure`}
                    aria-expanded={isExpanded}
                    className={cn("flex w-full items-center justify-between text-left hover:text-items-blueHover", isActive && "text-items-blue")}
                    href={item.href}
                    onClick={(event) => handleDisclosureClick(event, item, disclosureRoute)}
                    prefetch
                  >
                    <span>{item.label}</span>
                    <AnimatedPlusMinus open={isExpanded} />
                  </Link>
                ) : (
                  <Link
                    className={cn("flex w-full items-center justify-between hover:text-items-blueHover", isActive && "text-items-blue")}
                    href={item.href}
                    onClick={(event) => handleNavClick(event, item)}
                    prefetch
                  >
                    <span>{item.label}</span>
                    <AnimatedPlusMinus open={isActive} />
                  </Link>
                )}
                {isDisclosure && (
                  <SidebarDisclosure id={`${item.route}-sidebar-disclosure`} onTransitionComplete={() => handleDisclosureTransitionComplete(disclosureRoute)} open={isExpanded}>
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

        <div className="shrink-0 pb-9 pt-8">
          <FooterLinks hideInstagram hideShipping afterPrivacy={<SidebarContactActions />} />
        </div>
      </div>
      <div aria-hidden className="items-sidebar-divider absolute bottom-9 right-0 w-px bg-items-blue" />
    </aside>
  );
}
