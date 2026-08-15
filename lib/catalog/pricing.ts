import type { CatalogItem } from "@/lib/catalog/types";

type PricedItem = Pick<CatalogItem, "myrPriceCents" | "usdPriceCents" | "priceCents" | "currency">;

export function itemPriceLabels(item: PricedItem) {
  const legacyCurrency = item.currency?.toUpperCase();
  const myrPriceCents = item.myrPriceCents ?? (legacyCurrency === "MYR" ? item.priceCents : undefined);
  const usdPriceCents = item.usdPriceCents ?? (legacyCurrency === "USD" ? item.priceCents : undefined);

  return [
    myrPriceCents === undefined ? undefined : `MYR ${(myrPriceCents / 100).toFixed(2)}`,
    usdPriceCents === undefined ? undefined : `USD ${(usdPriceCents / 100).toFixed(2)}`
  ].filter((price): price is string => Boolean(price));
}
