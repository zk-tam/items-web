import { describe, expect, it } from "vitest";
import { parseLinks, parsePriceCents, parseSeoDescription, parseSeoTitle, parseSlug } from "../lib/admin/validation";

describe("admin form validation", () => {
  it("normalizes a valid slug and converts MYR to cents", () => {
    expect(parseSlug("Thunder-Vase")).toBe("thunder-vase");
    expect(parsePriceCents("12.5")).toBe(1250);
  });

  it("rejects invalid slugs, prices, and social URLs", () => {
    expect(() => parseSlug("Invalid slug")).toThrow("Slug");
    expect(() => parsePriceCents("10.999")).toThrow("Price");
    expect(() => parseLinks("Instagram | javascript:alert(1)")).toThrow("valid http(s)");
  });

  it("accepts bare social URLs and infers an Instagram label", () => {
    expect(parseLinks("https://www.instagram.com/itemsartist/")).toEqual([
      { label: "Instagram", url: "https://www.instagram.com/itemsartist/" }
    ]);
  });

  it("limits editable SEO fields to search-result-friendly lengths", () => {
    expect(parseSeoTitle("x".repeat(70))).toHaveLength(70);
    expect(() => parseSeoTitle("x".repeat(71))).toThrow("70 characters");
    expect(parseSeoDescription("x".repeat(160))).toHaveLength(160);
    expect(() => parseSeoDescription("x".repeat(161))).toThrow("160 characters");
  });
});
