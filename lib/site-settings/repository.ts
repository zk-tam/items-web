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

type MainNavigationLabelsRow = MainNavigationLabels;

const defaultMainNavigationLabels: MainNavigationLabels = {
  shopLabel: "Shop All",
  artistsLabel: "Artists"
};

async function queryMainNavigationLabels() {
  const row = await queryRow<MainNavigationLabelsRow>(
    `select shop_label as "shopLabel", artists_label as "artistsLabel"
     from site_settings
     where id = true`
  );

  return row ?? defaultMainNavigationLabels;
}

const cachedMainNavigationLabels = unstable_cache(
  queryMainNavigationLabels,
  ["main-navigation-labels"],
  { revalidate: 3600, tags: [SITE_SETTINGS_CACHE_TAG] }
);

export const getMainNavigationLabels = cache(cachedMainNavigationLabels);

export async function getPrimaryNavigation() {
  const labels = await getMainNavigationLabels();

  return primaryNavigation.map((item): NavigationItem => {
    if (item.route === "shop") return { ...item, label: labels.shopLabel };
    if (item.route === "artists") return { ...item, label: labels.artistsLabel };
    return item;
  });
}

export async function saveMainNavigationLabels(input: MainNavigationLabels) {
  const row = await queryRow<MainNavigationLabelsRow>(
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
