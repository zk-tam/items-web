import { describe, expect, it } from "vitest";
import { getInstagramUrl, isInstagramUrl } from "../lib/catalog/socials";

describe("artist social links", () => {
  it("identifies Instagram from the URL rather than the editable label", () => {
    const links = [
      { label: "Portfolio", href: "https://artist.example/work" },
      { label: "Photos", href: "https://www.instagram.com/artist.name/?utm_source=bio" }
    ];

    expect(getInstagramUrl(links)).toBe("https://www.instagram.com/artist.name/?utm_source=bio");
  });

  it("does not mistake a URL containing the word Instagram for an Instagram link", () => {
    expect(isInstagramUrl("https://artist.example/instagram")).toBe(false);
    expect(getInstagramUrl([{ label: "Work", href: "https://artist.example/instagram" }])).toBeUndefined();
  });
});
