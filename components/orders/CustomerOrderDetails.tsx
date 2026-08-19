import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Clock3, Download, ExternalLink, MapPin, PackageCheck, Truck } from "lucide-react";
import type { AdminOrder, OrderLine } from "@/lib/admin/repository";

type CustomerOrderDetailsProps = {
  order: AdminOrder;
  lines: OrderLine[];
  token: string;
};

function money(cents: number) {
  return new Intl.NumberFormat("en-MY", { style: "currency", currency: "MYR" }).format(cents / 100);
}

function label(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function publicOrderNumber(value: string) {
  return value.replace(/^ORD-/, "#");
}

function statusTone(status: AdminOrder["status"]) {
  if (status === "completed") return "border-emerald-600/30 bg-emerald-50 text-emerald-800";
  if (status === "cancelled") return "border-red-600/30 bg-red-50 text-red-700";
  if (status === "shipped") return "border-blue-600/30 bg-blue-50 text-blue-800";
  return "border-items-blue/25 bg-items-blue/5 text-items-blue";
}

function paymentTone(status: AdminOrder["paymentStatus"]) {
  if (status === "paid") return "border-emerald-600/30 bg-emerald-50 text-emerald-800";
  if (status === "refunded") return "border-amber-600/30 bg-amber-50 text-amber-800";
  return "border-items-blue/25 bg-items-blue/5 text-items-blue";
}

export function CustomerOrderDetails({ order, lines, token }: CustomerOrderDetailsProps) {
  const totalCents = lines.reduce((total, line) => total + line.quantity * line.unitPriceCents, 0);
  const itemCount = lines.reduce((total, line) => total + line.quantity, 0);
  const placedOn = new Intl.DateTimeFormat("en-MY", { dateStyle: "long" }).format(order.createdAt);
  const canDownloadInvoice = order.status !== "cancelled";

  return (
    <main className="min-h-screen bg-[var(--items-canvas)] px-4 py-6 text-slate-900 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-start justify-between gap-6 border-b border-items-blue/20 pb-6">
          <Link href="/" aria-label="ITEMS home" className="inline-block">
            <Image src="/assets/logo.svg" alt="ITEMS" width={116} height={83} priority className="h-20 w-auto" />
          </Link>
          <div className="text-right">
            <h1 className="text-2xl font-black tracking-tight text-items-blue sm:text-3xl">{publicOrderNumber(order.orderNumber)}</h1>
            <p className="mt-1 text-sm font-medium text-slate-600">Placed on {placedOn}</p>
          </div>
        </header>

        <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(18rem,0.85fr)]">
          <div className="space-y-5">
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-[var(--items-surface)] shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-2 text-sm font-black text-slate-800"><PackageCheck aria-hidden className="h-4 w-4 text-items-blue" /> Order items <span className="text-slate-500">({itemCount})</span></div>
                <span className={`border px-2.5 py-1 text-xs font-black ${statusTone(order.status)}`}>{label(order.status)}</span>
              </div>
              <ul className="divide-y divide-slate-200">
                {lines.map((line, index) => (
                  <li key={line.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-3 px-5 py-4 sm:grid-cols-[auto_minmax(0,1fr)_auto_auto] sm:px-6">
                    <div className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg border border-items-blue/20 bg-items-blue/5 text-sm font-black text-items-blue">
                      {line.thumbnailUrl ? <Image src={line.thumbnailUrl} alt="" fill sizes="48px" className="object-cover" /> : index + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black leading-tight text-slate-900">{line.itemName}</p>
                      <p className="mt-1 text-sm font-medium text-slate-500">{line.artistName}</p>
                    </div>
                    <p className="hidden self-center text-sm font-medium text-slate-500 sm:block">{money(line.unitPriceCents)} × {line.quantity}</p>
                    <p className="self-center text-right font-black text-slate-900">{money(line.unitPriceCents * line.quantity)}</p>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-xl border border-slate-200 bg-[var(--items-surface)] p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-2 font-black text-slate-800"><CheckCircle2 aria-hidden className="h-4 w-4 text-items-blue" /> Payment summary</div>
              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between gap-5 text-slate-600"><dt>Items</dt><dd>{itemCount}</dd></div>
                <div className="flex justify-between gap-5 text-slate-600"><dt>Payment status</dt><dd className="font-bold">{label(order.paymentStatus)}</dd></div>
                <div className="flex justify-between gap-5 border-t border-slate-200 pt-3 text-base font-black text-slate-900"><dt>Total</dt><dd>{money(totalCents)}</dd></div>
              </dl>
            </section>
          </div>

          <aside className="space-y-5">
            <section className="rounded-xl border border-slate-200 bg-[var(--items-surface)] p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Order status</p>
              <div className="mt-4 space-y-3">
                <span className={`inline-flex border px-2.5 py-1 text-sm font-black ${statusTone(order.status)}`}>{label(order.status)}</span>
                <p className="flex items-center gap-2 text-sm font-medium text-slate-600"><Clock3 aria-hidden className="h-4 w-4 text-items-blue" /> Last updated {new Intl.DateTimeFormat("en-MY", { dateStyle: "medium" }).format(order.updatedAt)}</p>
                <span className={`inline-flex border px-2.5 py-1 text-sm font-black ${paymentTone(order.paymentStatus)}`}>Payment: {label(order.paymentStatus)}</span>
                {order.shipmentUrl && (
                  <a href={order.shipmentUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 pt-1 text-sm font-black text-items-blue underline underline-offset-4"><Truck aria-hidden className="h-4 w-4" /> Track shipment <ExternalLink aria-hidden className="h-3.5 w-3.5" /></a>
                )}
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-[var(--items-surface)] p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Customer</p>
              <h2 className="mt-3 font-black text-slate-900">{order.customerName}</h2>
              <div className="mt-4 space-y-1 text-sm font-medium text-slate-600">
                {order.customerEmail && <p>{order.customerEmail}</p>}
                {order.customerPhone && <p>{order.customerPhone}</p>}
              </div>
              <div className="mt-5 border-t border-slate-200 pt-4">
                <p className="flex items-center gap-2 text-sm font-black text-slate-800"><MapPin aria-hidden className="h-4 w-4 text-items-blue" /> Shipping address</p>
                <p className="mt-2 whitespace-pre-line text-sm font-medium leading-relaxed text-slate-600">{order.shippingAddress || "Shipping details will be confirmed with you."}</p>
              </div>
            </section>

            {canDownloadInvoice && (
              <a href={`/orders/${token}/invoice`} className="flex items-center justify-center gap-2 rounded-xl bg-items-blue px-4 py-3.5 text-sm font-black text-items-white transition-colors hover:bg-items-blueHover">
                <Download aria-hidden className="h-4 w-4" /> Download invoice
              </a>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
