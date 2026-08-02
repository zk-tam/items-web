import type { OrderStatus, PaymentStatus } from "@/lib/admin/repository";

export function inventoryTransition(currentlyCommitted: boolean, status: OrderStatus, paymentStatus: PaymentStatus) {
  const shouldRestore = currentlyCommitted && (paymentStatus === "refunded" || status === "cancelled");
  const shouldCommit = !currentlyCommitted && !shouldRestore && paymentStatus === "paid" && status !== "cancelled";
  return { shouldCommit, shouldRestore };
}
