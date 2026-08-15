import type { ReactNode } from "react";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { DetailPageHeader } from "@/components/layout/DetailPageHeader";
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
    <div className={cn("min-h-screen", theme === "dim" && "items-dim")}>
      <div className="hidden lg:block">
        <div className={cn("items-frame max-w-[1600px]", lockDesktopViewport && "h-[calc(100vh-48px)]")}>
          {detailHeader ? (
            <section className={cn("min-w-0", lockDesktopViewport && "flex h-full min-h-0 flex-col")}>
              <DetailPageHeader />
              <div className={cn("p-9", lockDesktopViewport && "min-h-0 flex-1 overflow-hidden", contentClassName)}>{children}</div>
            </section>
          ) : (
            <div className={cn("grid grid-cols-[var(--items-sidebar-width)_minmax(0,1fr)]", lockDesktopViewport ? "h-full min-h-0" : "min-h-[760px]")}>
              <DesktopSidebar
                activeRoute={activeRoute}
                artistMenuExpanded={artistMenuExpanded}
                artistMenuItems={artistMenuItems}
                productMenuExpanded={productMenuExpanded}
                productMenuItems={productMenuItems}
                viewportLocked={lockDesktopViewport}
              />
              <section className={cn("min-w-0", lockDesktopViewport && "flex min-h-0 flex-col")}>
                <header className="flex h-[240px] shrink-0 items-start justify-end border-b border-items-blue p-9">
                  <UtilityIcons />
                </header>
                <div className={cn("p-9", lockDesktopViewport && "min-h-0 flex-1 overflow-hidden", contentClassName)}>{children}</div>
              </section>
            </div>
          )}
        </div>
      </div>

      <div className="lg:hidden">
        <div className="items-mobile-frame">
          <MobileHeader activeRoute={activeRoute} />
          <div className={cn("px-7 py-8", contentClassName)}>{children}</div>
        </div>
      </div>
    </div>
  );
}
