import type { ReactNode } from "react";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { UtilityIcons } from "@/components/layout/UtilityIcons";
import type { ArtistMenuItem, PrimaryRoute } from "@/data/navigation";
import { cn } from "@/lib/utils";

type SiteShellProps = {
  children: ReactNode;
  activeRoute?: PrimaryRoute;
  artistMenuItems?: ArtistMenuItem[];
  artistMenuExpanded?: boolean;
  theme?: "light" | "dim";
  contentClassName?: string;
};

export function SiteShell({
  children,
  activeRoute,
  artistMenuItems,
  artistMenuExpanded = false,
  theme = "light",
  contentClassName
}: SiteShellProps) {
  return (
    <div className={cn("min-h-screen", theme === "dim" && "items-dim")}>
      <div className="hidden lg:block">
        <div className="items-frame">
          <div className="grid min-h-[760px] grid-cols-[var(--items-sidebar-width)_minmax(0,1fr)]">
            <DesktopSidebar activeRoute={activeRoute} artistMenuExpanded={artistMenuExpanded} artistMenuItems={artistMenuItems} />
            <section className="min-w-0">
              <header className="flex h-[240px] items-start justify-end border-b border-items-blue p-9">
                <UtilityIcons />
              </header>
              <div className={cn("p-9", contentClassName)}>{children}</div>
            </section>
          </div>
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
