import { describe, expect, it } from "vitest";
import { extractExternalReferrerHost, getAnalyticsDateRange, isKnownCrawler, isTrackablePublicPath, normalizeAnalyticsPath, normalizeCountryCode, parseAnalyticsPageView } from "../lib/analytics/definitions";

describe("analytics event handling", () => {
  it("normalizes public paths while keeping item and artist slugs distinct", () => {
    expect(normalizeAnalyticsPath("/products/thunder-vase/?utm_source=instagram#details")).toBe("/products/thunder-vase");
    expect(normalizeAnalyticsPath("/artists/k3%40n")).toBe("/artists/k3%40n");
    expect(isTrackablePublicPath("/products/thunder-vase")).toBe(true);
    expect(isTrackablePublicPath("/admin/analytics")).toBe(false);
    expect(normalizeAnalyticsPath("https://example.com/products/thunder-vase")).toBeNull();
  });

  it("records a referrer only for a landing page view", () => {
    const eventId = "70e6fda4-d0f7-4ccb-8e1a-ec028efb16fe";
    expect(parseAnalyticsPageView({ eventId, path: "/products/thunder-vase", isLanding: true, referrer: "https://www.instagram.com/items.art/" })).toMatchObject({
      path: "/products/thunder-vase",
      isLanding: true,
      referrer: "https://www.instagram.com/items.art/"
    });
    expect(parseAnalyticsPageView({ eventId, path: "/artists", isLanding: false, referrer: "https://www.instagram.com/items.art/" })?.referrer).toBeNull();
  });

  it("keeps only an external referral hostname", () => {
    expect(extractExternalReferrerHost("https://WWW.Instagram.com/items.art/?x=1", "itemsyouwant.com")).toBe("www.instagram.com");
    expect(extractExternalReferrerHost("https://itemsyouwant.com/products/thunder-vase", "itemsyouwant.com")).toBeNull();
    expect(extractExternalReferrerHost("https://www.itemsyouwant.com/products/thunder-vase", "itemsyouwant.com")).toBeNull();
    expect(extractExternalReferrerHost("not a URL", "itemsyouwant.com")).toBeNull();
  });

  it("filters known crawlers and reports default dates in Malaysia time", () => {
    expect(isKnownCrawler("Googlebot/2.1 (+http://www.google.com/bot.html)")).toBe(true);
    expect(isKnownCrawler("Mozilla/5.0")).toBe(false);
    const range = getAnalyticsDateRange(undefined, undefined, new Date("2026-08-18T16:30:00.000Z"));
    expect(range.fromDate).toBe("2026-07-21");
    expect(range.toDate).toBe("2026-08-19");
    expect(range.from.toISOString()).toBe("2026-07-20T16:00:00.000Z");
    expect(range.until.toISOString()).toBe("2026-08-19T16:00:00.000Z");
  });

  it("accepts only two-letter country codes from the hosting provider", () => {
    expect(normalizeCountryCode("my")).toBe("MY");
    expect(normalizeCountryCode("MYS")).toBeNull();
    expect(normalizeCountryCode(null)).toBeNull();
  });
});
