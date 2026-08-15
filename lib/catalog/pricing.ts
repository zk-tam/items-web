import type { CatalogItem } from "@/lib/catalog/types";

type PricedItem = Pick<CatalogItem, "myrPriceCents" | "usdPriceCents" | "priceCents" | "currency">;

export type ItemPrice = {
  currency: "MYR" | "USD";
  cents: number;
};

export function itemPrices(item: PricedItem): ItemPrice[] {
  const legacyCurrency = item.currency?.toUpperCase();
  const myrPriceCents = item.myrPriceCents ?? (legacyCurrency === "MYR" ? item.priceCents : undefined);
  const usdPriceCents = item.usdPriceCents ?? (legacyCurrency === "USD" ? item.priceCents : undefined);

  return [
    myrPriceCents === undefined ? undefined : { currency: "MYR", cents: myrPriceCents },
    usdPriceCents === undefined ? undefined : { currency: "USD", cents: usdPriceCents }
  ].filter((price): price is ItemPrice => Boolean(price));
}

export function itemPriceLabels(item: PricedItem) {
  return itemPrices(item).map((price) => `${price.currency} ${(price.cents / 100).toFixed(2)}`);
}
