import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "../lib/auth/password";

describe("password hashing", () => {
  it("uses a unique salt and verifies only the matching password", async () => {
    const first = await hashPassword("long-enough-password");
    const second = await hashPassword("long-enough-password");

    expect(first).not.toBe(second);
    await expect(verifyPassword("long-enough-password", first)).resolves.toBe(true);
    await expect(verifyPassword("different-password", first)).resolves.toBe(false);
  });

  it("rejects short passwords before storing them", async () => {
    await expect(hashPassword("too-short")).rejects.toThrow("at least 12");
  });
});
