import { describe, expect, it } from "vitest";
import { inventoryTransition } from "../lib/admin/order-state";

describe("order inventory transitions", () => {
  it("commits stock once an unpaid active order becomes paid", () => {
    expect(inventoryTransition(false, "processing", "paid")).toEqual({ shouldCommit: true, shouldRestore: false });
  });

  it("restores committed stock when an order is refunded or cancelled", () => {
    expect(inventoryTransition(true, "processing", "refunded")).toEqual({ shouldCommit: false, shouldRestore: true });
    expect(inventoryTransition(true, "cancelled", "paid")).toEqual({ shouldCommit: false, shouldRestore: true });
  });

  it("does not commit stock for a cancelled order", () => {
    expect(inventoryTransition(false, "cancelled", "paid")).toEqual({ shouldCommit: false, shouldRestore: false });
  });
});
