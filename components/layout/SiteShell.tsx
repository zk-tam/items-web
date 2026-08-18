import type { ReactNode } from "react";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { DetailPageHeader } from "@/components/layout/DetailPageHeader";
import { FooterLinks } from "@/components/layout/FooterLinks";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { UtilityIcons } from "@/components/layout/UtilityIcons";
import type { ArtistMenuItem, PrimaryRoute, ProductMenuItem } from "@/data/navigation";
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

export function SiteShell({
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
  return (
    <div className={cn("min-h-screen", lockDesktopViewport && "lg:h-screen lg:overflow-hidden", theme === "dim" && "items-dim")}>
      <div className="hidden lg:block">
        <div className={cn("items-frame max-w-[1600px]", lockDesktopViewport && "h-[calc(100vh-48px)]")}>
          {detailHeader ? (
            <section className={cn("min-w-0", lockDesktopViewport && "flex h-full min-h-0 flex-col")}>
              <DetailPageHeader />
              <div className={cn("p-9", lockDesktopViewport && "min-h-0 flex-1 overflow-hidden", contentClassName)}>{children}</div>
            </section>
          ) : (
            <div className={cn("grid grid-cols-[var(--items-sidebar-width)_minmax(0,1fr)]", lockDesktopViewport ? "h-full min-h-0" : "min-h-[calc(100vh-48px)]")}>
              <DesktopSidebar
                activeRoute={activeRoute}
                artistMenuExpanded={artistMenuExpanded}
                artistMenuItems={artistMenuItems}
                productMenuExpanded={productMenuExpanded}
                productMenuItems={productMenuItems}
                viewportLocked={lockDesktopViewport}
              />
              <section className={cn("min-w-0", lockDesktopViewport && "flex min-h-0 flex-col")}>
                <header className="relative flex h-[var(--items-header-height)] shrink-0 items-center justify-end px-9">
                  <UtilityIcons stacked className="h-[var(--items-header-logo-size)]" />
                  <div aria-hidden className="absolute bottom-0 left-0 right-9 h-px bg-items-blue" />
                </header>
                <div className={cn("p-9", lockDesktopViewport && "min-h-0 flex-1 overflow-y-auto overscroll-contain", contentClassName)}>{children}</div>
              </section>
            </div>
          )}
        </div>
      </div>

      <div className="lg:hidden">
        <div className="items-mobile-frame">
          <MobileHeader activeRoute={activeRoute} />
          <div className={cn("px-7 py-8", contentClassName)}>{children}</div>
          <footer className="px-7 pb-8"><FooterLinks /></footer>
        </div>
      </div>
    </div>
  );
}
