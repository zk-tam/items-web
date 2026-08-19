"use client";

import { useState, type FormEvent } from "react";
import { ArrowDownUp, Check, Filter, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type OrderSort = "newest" | "oldest" | "updated";
type OrderStatus = "draft" | "awaiting_payment" | "processing" | "shipped" | "completed" | "cancelled";

const sortingOptions: Array<{ value: OrderSort; label: string }> = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "updated", label: "Last updated" }
];

const statusOptions: Array<{ value: OrderStatus; label: string }> = [
  { value: "draft", label: "Draft" },
  { value: "awaiting_payment", label: "Awaiting payment" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" }
];

type OrderListControlsProps = {
  id: string;
  sort: OrderSort;
  status?: OrderStatus;
};

export function OrderListControls({ id, sort, status }: OrderListControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [openMenu, setOpenMenu] = useState<"sort" | "status" | null>(null);

  function navigate(changes: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    navigate({ id: String(formData.get("id") ?? "").trim() || undefined });
  }

  return (
    <div className="relative z-30 mt-8 flex flex-wrap items-center gap-2">
      <form onSubmit={search} className="flex h-11 min-w-[min(100%,22rem)] flex-1 border border-items-blue bg-transparent md:max-w-md">
        <label className="sr-only" htmlFor="order-id-search">Search order ID or number</label>
        <input id="order-id-search" name="id" defaultValue={id} placeholder="Search order ID" className="min-w-0 flex-1 bg-transparent px-3 text-sm font-bold outline-none placeholder:text-items-blue/55" />
        <button type="submit" aria-label="Search orders" className="grid w-11 shrink-0 place-items-center border-l border-items-blue text-items-blue transition-colors hover:bg-items-blue hover:text-items-white"><Search aria-hidden className="h-4 w-4" /></button>
      </form>

      <div className="relative">
        <button type="button" onClick={() => setOpenMenu((current) => current === "sort" ? null : "sort")} aria-label="Sort orders" aria-expanded={openMenu === "sort"} title="Sort orders" className="grid h-11 w-11 place-items-center border border-items-blue text-items-blue transition-colors hover:bg-items-blue hover:text-items-white"><ArrowDownUp aria-hidden className="h-4 w-4" /></button>
        {openMenu === "sort" ? <div role="menu" className="absolute right-0 top-[calc(100%+0.5rem)] z-40 w-44 border border-items-blue bg-[var(--items-surface)] p-1 shadow-[4px_4px_0_var(--items-blue)]">{sortingOptions.map((option) => <button key={option.value} role="menuitem" type="button" onClick={() => { navigate({ sort: option.value }); setOpenMenu(null); }} className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-bold hover:bg-items-blue hover:text-items-white">{option.label}{sort === option.value ? <Check aria-hidden className="h-4 w-4" /> : null}</button>)}</div> : null}
      </div>

      <div className="relative">
        <button type="button" onClick={() => setOpenMenu((current) => current === "status" ? null : "status")} aria-label="Filter orders by status" aria-expanded={openMenu === "status"} title="Filter by status" className={`grid h-11 w-11 place-items-center border border-items-blue transition-colors hover:bg-items-blue hover:text-items-white ${status ? "bg-items-blue text-items-white" : "text-items-blue"}`}><Filter aria-hidden className="h-4 w-4" /></button>
        {openMenu === "status" ? <div role="menu" className="absolute right-0 top-[calc(100%+0.5rem)] z-40 w-48 border border-items-blue bg-[var(--items-surface)] p-1 shadow-[4px_4px_0_var(--items-blue)]"><button role="menuitem" type="button" onClick={() => { navigate({ status: undefined }); setOpenMenu(null); }} className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-bold hover:bg-items-blue hover:text-items-white">All statuses{!status ? <Check aria-hidden className="h-4 w-4" /> : null}</button>{statusOptions.map((option) => <button key={option.value} role="menuitem" type="button" onClick={() => { navigate({ status: option.value }); setOpenMenu(null); }} className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-bold hover:bg-items-blue hover:text-items-white">{option.label}{status === option.value ? <Check aria-hidden className="h-4 w-4" /> : null}</button>)}</div> : null}
      </div>
    </div>
  );
}
