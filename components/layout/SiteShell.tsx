import type { ReactNode } from "react";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { DetailPageHeader } from "@/components/layout/DetailPageHeader";
import { FooterLinks } from "@/components/layout/FooterLinks";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { SidebarContactActions } from "@/components/layout/SidebarContactActions";
import { UtilityIcons } from "@/components/layout/UtilityIcons";
import type { ArtistMenuItem, PrimaryRoute, ProductMenuItem } from "@/data/navigation";
import { listArtists, listProducts } from "@/lib/db/items-repository";
import { getPrimaryNavigation } from "@/lib/site-settings/repository";
import { cn } from "@/lib/utils";

type SiteShellProps = {
  children: ReactNode;
  activeRoute?: PrimaryRoute;
  artistMenuItems?: ArtistMenuItem[];
  artistMenuExpanded?: boolean;
  productMenuItems?: ProductMenuItem[];
  productMenuExpanded?: boolean;
  lockDesktopViewport?: boolean;
  detailHeader?: boolean;
  theme?: "light" | "dim";
  contentClassName?: string;
};

export async function SiteShell({
  children,
  activeRoute,
  artistMenuItems,
  artistMenuExpanded = false,
  productMenuItems,
  productMenuExpanded = false,
  lockDesktopViewport = false,
  detailHeader = false,
  theme = "light",
  contentClassName
}: SiteShellProps) {
  const [navigation, catalogMenus] = await Promise.all([
    getPrimaryNavigation(),
    detailHeader ? Promise.resolve(null) : Promise.all([listArtists(), listProducts()])
  ]);
  const resolvedArtistMenuItems = artistMenuItems ?? catalogMenus?.[0].map((artist) => ({
    name: artist.name,
    href: `/artists/${artist.slug}`
  })) ?? [];
  const resolvedProductMenuItems = productMenuItems ?? catalogMenus?.[1].map((product) => ({
    name: product.name,
    href: `/products/${product.slug}`
  })) ?? [];

  return (
    <div className={cn("min-h-screen", lockDesktopViewport && "lg:h-screen lg:overflow-hidden", theme === "dim" && "items-dim")}>
      <div className="hidden lg:block">
        <div className={cn("items-frame max-w-[1600px]", lockDesktopViewport && "h-[calc(100vh-30px)]")}>
          {detailHeader ? (
            <section className={cn("min-w-0", lockDesktopViewport && "flex h-full min-h-0 flex-col")}>
              <DetailPageHeader navigation={navigation} />
              <div className={cn("p-8 pb-0", lockDesktopViewport && "min-h-0 flex-1 overflow-hidden", contentClassName)}>{children}</div>
            </section>
          ) : (
            <div className={cn("grid grid-cols-[var(--items-sidebar-width)_minmax(0,1fr)]", lockDesktopViewport ? "h-full min-h-0" : "min-h-[calc(100vh-48px)]")}>
              <DesktopSidebar
                activeRoute={activeRoute}
                navigation={navigation}
                artistMenuExpanded={artistMenuExpanded}
                artistMenuItems={resolvedArtistMenuItems}
                productMenuExpanded={productMenuExpanded}
                productMenuItems={resolvedProductMenuItems}
                viewportLocked={lockDesktopViewport}
              />
              <section className={cn("min-w-0", lockDesktopViewport && "flex min-h-0 flex-col")}>
                <header className="relative flex h-[var(--items-header-height)] shrink-0 items-center justify-end px-9">
                  <UtilityIcons stacked className="h-[var(--items-header-logo-size)]" />
                  <div aria-hidden className="absolute bottom-0 left-0 right-8 h-px bg-items-blue" />
                </header>
                <div className={cn("p-8", lockDesktopViewport && "min-h-0 flex-1 overflow-y-auto overscroll-contain", contentClassName)}>{children}</div>
              </section>
            </div>
          )}
        </div>
      </div>

      <div className="lg:hidden">
        <div className="items-mobile-frame">
          <MobileHeader activeRoute={activeRoute} navigation={navigation} />
          <div className={cn("px-7 py-8", contentClassName)}>{children}</div>
          <footer className="px-7 pb-8"><FooterLinks hideInstagram hideShipping afterPrivacy={<SidebarContactActions />} /></footer>
        </div>
      </div>
    </div>
  );
}
