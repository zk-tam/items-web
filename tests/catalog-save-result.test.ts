import { describe, expect, it } from "vitest";
import { catalogSaveErrorMessage } from "../lib/admin/catalog-save-result";

describe("catalog save errors", () => {
  it("returns actionable validation errors to an authenticated admin", () => {
    expect(catalogSaveErrorMessage(new Error("Slug may contain lowercase letters only."), "item"))
      .toBe("Slug may contain lowercase letters only.");
    expect(catalogSaveErrorMessage(new Error("One or more existing media files do not belong to this item."), "item"))
      .toBe("One or more existing media files do not belong to this item.");
  });

  it("maps database constraint errors without exposing database details", () => {
    expect(catalogSaveErrorMessage({ code: "23505" }, "artist")).toBe("That URL handle is already in use.");
    expect(catalogSaveErrorMessage({ code: "23503" }, "item")).toBe("One or more selected artists are unavailable.");
  });

  it("keeps unexpected infrastructure errors in server logs only", () => {
    expect(catalogSaveErrorMessage(new Error("connection refused: secret-host"), "item")).toBeNull();
  });
});
