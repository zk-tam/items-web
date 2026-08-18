import { describe, expect, it } from "vitest";
import { cartCheckoutMessage, cartCheckoutWhatsappUrl } from "../lib/cart/message";

describe("cart checkout message", () => {
  it("creates a numbered list and includes quantities only when needed", () => {
    expect(cartCheckoutMessage([
      { name: "Thunder Vase", quantity: 1 },
      { name: "Frames Chair", quantity: 2 }
    ])).toBe("Ideas I want, Plus some:\n1. Thunder Vase\n2. Frames Chair ×2");
  });

  it("encodes the same message into the ITEMS WhatsApp checkout link", () => {
    expect(cartCheckoutWhatsappUrl([{ name: "Thunder Vase", quantity: 1 }])).toBe(
      "http://wa.me/60176226280?text=Ideas%20I%20want%2C%20Plus%20some%3A%0A1.%20Thunder%20Vase"
    );
  });
});
