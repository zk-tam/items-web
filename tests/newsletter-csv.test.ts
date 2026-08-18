import { describe, expect, it } from "vitest";
import { newsletterSubscribersCsv } from "../lib/newsletter/csv";

describe("newsletter subscriber CSV export", () => {
  it("exports headers, email addresses, and UTC timestamps safely", () => {
    expect(newsletterSubscribersCsv([
      { email: "name+\"quote\"@example.com", subscribedAt: new Date("2026-08-18T12:34:56.000Z") }
    ])).toBe("\uFEFFEmail,Subscribed at (UTC)\r\n\"name+\"\"quote\"\"@example.com\",\"2026-08-18T12:34:56.000Z\"\r\n");
  });
});
