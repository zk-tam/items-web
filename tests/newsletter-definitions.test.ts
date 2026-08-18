import { describe, expect, it } from "vitest";
import { parseNewsletterEmail } from "../lib/newsletter/definitions";

describe("newsletter subscription validation", () => {
  it("normalizes valid email addresses before storing them", () => {
    expect(parseNewsletterEmail("  HELLO@ITEMSART.COM ")).toBe("hello@itemsart.com");
  });

  it("rejects invalid or oversized email addresses", () => {
    expect(parseNewsletterEmail("not-an-email")).toBeNull();
    expect(parseNewsletterEmail(`${"a".repeat(250)}@test.com`)).toBeNull();
    expect(parseNewsletterEmail(null)).toBeNull();
  });
});
