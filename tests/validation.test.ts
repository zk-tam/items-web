import { describe, expect, it } from "vitest";
import { parseArtistMediaOrder, parseItemMediaOrder, parseLinks, parseOptionalNonNegativeInteger, parsePriceCents, parseSeoDescription, parseSeoTitle, parseSlug } from "../lib/admin/validation";
import { validateItemMediaUploadRequest } from "../lib/admin/item-media";

describe("admin form validation", () => {
  it("allows a blank optional display order", () => {
    expect(parseOptionalNonNegativeInteger(null, "Display order")).toBeNull();
    expect(parseOptionalNonNegativeInteger(new FormData().get("displayOrder"), "Display order")).toBeNull();
    expect(parseOptionalNonNegativeInteger("3", "Display order")).toBe(3);
    expect(() => parseOptionalNonNegativeInteger("-1", "Display order")).toThrow("non-negative");
  });

  it("normalizes a valid slug and converts MYR to cents", () => {
    expect(parseSlug("Thunder-Vase")).toBe("thunder-vase");
    expect(parseSlug("@ZZ_Liu")).toBe("@zz_liu");
    expect(parseSlug("ZZ.Liu")).toBe("zz.liu");
    expect(parsePriceCents("12.5")).toBe(1250);
  });

  it("rejects invalid slugs, prices, and social URLs", () => {
    expect(() => parseSlug("Invalid slug")).toThrow("Slug");
    expect(() => parseSlug("@_")).toThrow("Slug");
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

  it("accepts ordered media metadata and rejects tampered media orders", () => {
    expect(parseItemMediaOrder(JSON.stringify([
      { kind: "existing", id: "11111111-1111-1111-1111-111111111111", altText: " Cover image " },
      { kind: "new", storagePath: "items/11111111-1111-1111-1111-111111111112.mp4", mediaType: "video", mimeType: "video/mp4", altText: "Detail video" }
    ]))).toEqual([
      { kind: "existing", id: "11111111-1111-1111-1111-111111111111", altText: "Cover image" },
      { kind: "new", storagePath: "items/11111111-1111-1111-1111-111111111112.mp4", mediaType: "video", mimeType: "video/mp4", altText: "Detail video" }
    ]);

    expect(() => parseItemMediaOrder(JSON.stringify([
      { kind: "new", storagePath: "items/11111111-1111-1111-1111-111111111112.gif", mediaType: "image", mimeType: "image/gif" },
      { kind: "new", storagePath: "items/11111111-1111-1111-1111-111111111112.gif", mediaType: "image", mimeType: "image/gif" }
    ]))).toThrow("duplicates");
    expect(() => parseItemMediaOrder(JSON.stringify([{ kind: "new", storagePath: "items/not-a-uuid.mp4", mediaType: "video", mimeType: "video/mp4" }]))).toThrow("invalid");
  });

  it("accepts artist-gallery paths only in the artist media order", () => {
    const artistPath = "artists/11111111-1111-1111-1111-111111111112.mp4";
    expect(parseArtistMediaOrder(JSON.stringify([
      { kind: "new", storagePath: artistPath, mediaType: "video", mimeType: "video/mp4", altText: "Studio video" }
    ]))).toEqual([
      { kind: "new", storagePath: artistPath, mediaType: "video", mimeType: "video/mp4", altText: "Studio video" }
    ]);
    expect(() => parseArtistMediaOrder(JSON.stringify([
      { kind: "new", storagePath: artistPath.replace("artists/", "items/"), mediaType: "video", mimeType: "video/mp4" }
    ]))).toThrow("invalid");
  });

  it("accepts supported GIF/MP4 uploads and enforces their size limits", () => {
    expect(validateItemMediaUploadRequest({ name: "loop.gif", mimeType: "image/gif", size: 1024 })).toMatchObject({ mimeType: "image/gif" });
    expect(validateItemMediaUploadRequest({ name: "lookbook.mp4", mimeType: "video/mp4", size: 1024 })).toMatchObject({ mimeType: "video/mp4" });
    expect(() => validateItemMediaUploadRequest({ name: "clip.mov", mimeType: "video/quicktime", size: 1024 })).toThrow("invalid");
    expect(() => validateItemMediaUploadRequest({ name: "too-large.mp4", mimeType: "video/mp4", size: 501 * 1024 * 1024 })).toThrow("500 MB");
  });
});
