import { describe, expect, it } from "vitest";
import { decodeCatalogSlug } from "../lib/catalog/slug";

describe("catalog route slugs", () => {
  it("decodes URL-safe symbols before the database lookup", () => {
    expect(decodeCatalogSlug("k3%40n")).toBe("k3@n");
    expect(decodeCatalogSlug("zz.liu")).toBe("zz.liu");
  });
});
