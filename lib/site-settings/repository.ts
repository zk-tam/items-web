import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { primaryNavigation, type NavigationItem } from "@/data/navigation";
import { queryRow } from "@/lib/db/postgres";

export const SITE_SETTINGS_CACHE_TAG = "site-settings";
export const MAIN_NAVIGATION_LABEL_MAX_LENGTH = 48;

export type MainNavigationLabels = {
  shopLabel: string;
  artistsLabel: string;
};

export type SiteSettings = MainNavigationLabels & {
  maintenanceMode: boolean;
};

type SiteSettingsRow = SiteSettings;

const defaultSiteSettings: SiteSettings = {
  shopLabel: "Shop All",
  artistsLabel: "Artists",
  maintenanceMode: false
};

async function querySiteSettings() {
  const row = await queryRow<SiteSettingsRow>(
    `select shop_label as "shopLabel", artists_label as "artistsLabel", maintenance_mode as "maintenanceMode"
     from site_settings
     where id = true`
  );

  return row ?? defaultSiteSettings;
}

const cachedSiteSettings = unstable_cache(
  querySiteSettings,
  ["site-settings"],
  { revalidate: 3600, tags: [SITE_SETTINGS_CACHE_TAG] }
);

export const getSiteSettings = cache(cachedSiteSettings);

export async function getMainNavigationLabels(): Promise<MainNavigationLabels> {
  const { shopLabel, artistsLabel } = await getSiteSettings();
  return { shopLabel, artistsLabel };
}

export async function isSiteMaintenanceModeEnabled() {
  return (await getSiteSettings()).maintenanceMode;
}

export async function getPrimaryNavigation() {
  const labels = await getMainNavigationLabels();

  return primaryNavigation.map((item): NavigationItem => {
    if (item.route === "shop") return { ...item, label: labels.shopLabel };
    if (item.route === "artists") return { ...item, label: labels.artistsLabel };
    return item;
  });
}

export async function saveMainNavigationLabels(input: MainNavigationLabels) {
  const row = await queryRow<MainNavigationLabels>(
    `insert into site_settings (id, shop_label, artists_label)
     values (true, $1, $2)
     on conflict (id) do update
       set shop_label = excluded.shop_label,
           artists_label = excluded.artists_label
     returning shop_label as "shopLabel", artists_label as "artistsLabel"`,
    [input.shopLabel, input.artistsLabel]
  );

  if (!row) throw new Error("Navigation labels could not be saved.");
  return row;
}

export async function saveSiteMaintenanceMode(maintenanceMode: boolean) {
  const row = await queryRow<{ maintenanceMode: boolean }>(
    `insert into site_settings (id, maintenance_mode)
     values (true, $1)
     on conflict (id) do update
       set maintenance_mode = excluded.maintenance_mode
     returning maintenance_mode as "maintenanceMode"`,
    [maintenanceMode]
  );

  if (!row) throw new Error("Maintenance mode could not be saved.");
  return row.maintenanceMode;
}
