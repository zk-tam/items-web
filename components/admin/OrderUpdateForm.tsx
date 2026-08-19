"use client";

import { useActionState, useEffect, useState } from "react";
import { CircleAlert, LoaderCircle } from "lucide-react";
import { type OrderActionState, updateOrderAction } from "@/app/admin/actions";
import type { AdminOrder } from "@/lib/admin/repository";

const orderStatuses = ["draft", "awaiting_payment", "processing", "shipped", "completed", "cancelled"];
const paymentStatuses = ["unpaid", "paid", "refunded"];
const initialState: OrderActionState = {};

export function OrderUpdateForm({ order }: { order: AdminOrder }) {
  const [state, formAction, pending] = useActionState(updateOrderAction.bind(null, order.id), initialState);
  const [dismissedErrorId, setDismissedErrorId] = useState<number | null>(null);

  useEffect(() => {
    if (!state.errorId) return;
    const timeout = window.setTimeout(() => setDismissedErrorId(state.errorId!), 4200);
    return () => window.clearTimeout(timeout);
  }, [state]);

  const toast = state.errorId === dismissedErrorId ? null : state.error;

  return (
    <>
      <form action={formAction} className="mt-8 grid max-w-3xl gap-5">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-1 font-bold">Customer name<input name="customerName" required defaultValue={order.customerName} className="border border-items-blue bg-transparent p-3" /></label>
          <label className="grid gap-1 font-bold">Email<input name="customerEmail" type="email" defaultValue={order.customerEmail ?? ""} className="border border-items-blue bg-transparent p-3" /></label>
        </div>
        <label className="grid gap-1 font-bold">Phone<input name="customerPhone" defaultValue={order.customerPhone ?? ""} className="border border-items-blue bg-transparent p-3" /></label>
        <label className="grid gap-1 font-bold">Shipping address<textarea name="shippingAddress" rows={3} defaultValue={order.shippingAddress ?? ""} className="border border-items-blue bg-transparent p-3" /></label>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-1 font-bold">Order status<select name="status" defaultValue={order.status} className="border border-items-blue bg-transparent p-3">{orderStatuses.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select></label>
          <label className="grid gap-1 font-bold">Payment status<select name="paymentStatus" defaultValue={order.paymentStatus} className="border border-items-blue bg-transparent p-3">{paymentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
        </div>
        <label className="grid gap-1 font-bold">Shipment URL<textarea name="shipmentUrl" rows={2} defaultValue={order.shipmentUrl ?? ""} className="border border-items-blue bg-transparent p-3" /></label>
        <label className="grid gap-1 font-bold">Internal notes<textarea name="notes" rows={4} defaultValue={order.notes ?? ""} className="border border-items-blue bg-transparent p-3" /></label>
        <button disabled={pending} className="flex w-fit items-center gap-2 bg-items-blue px-5 py-3 font-black text-items-white disabled:cursor-wait disabled:opacity-75">
          {pending ? <LoaderCircle aria-hidden className="h-4 w-4 animate-spin" /> : null}
          {pending ? "Saving order" : "Save order"}
        </button>
      </form>
      {toast ? (
        <div role="alert" className="fixed bottom-6 right-6 z-[100] flex max-w-[min(24rem,calc(100vw-3rem))] items-start gap-2 border border-red-600 bg-items-surface px-3 py-2 text-sm font-bold leading-snug text-red-700 shadow-[4px_4px_0_var(--items-blue)]">
          <CircleAlert aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{toast}</span>
        </div>
      ) : null}
    </>
  );
}
