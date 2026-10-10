"use client";

import Link from "next/link";
import { useState } from "react";
import { ItemOrderForm } from "@/components/admin/ItemOrderForm";

type ItemListEntry = {
  id: string;
  slug: string;
  name: string;
  artistName: string;
  myrPriceCents: number | null;
  usdPriceCents: number | null;
  stockCount: number;
  thumbnailUrl: string | null;
  isPublished: boolean;
  archivedAt: Date | string | null;
};

type ItemsManagementProps = {
  items: ItemListEntry[];
  orderSaved: boolean;
  updateOrderAction: (formData: FormData) => void | Promise<void>;
};

function itemPriceLabel(item: Pick<ItemListEntry, "myrPriceCents" | "usdPriceCents">) {
  return [
    item.myrPriceCents === null ? null : `MYR ${(item.myrPriceCents / 100).toFixed(2)}`,
    item.usdPriceCents === null ? null : `USD ${(item.usdPriceCents / 100).toFixed(2)}`
  ].filter(Boolean).join(" / ") || "—";
}

export function ItemsManagement({ items, orderSaved, updateOrderAction }: ItemsManagementProps) {
  const [isOrdering, setIsOrdering] = useState(false);
  const activeItems = items.filter((item) => !item.archivedAt).map((item) => ({
    id: item.id,
    name: item.name,
    artistName: item.artistName,
    imageUrl: item.thumbnailUrl,
    isPublished: item.isPublished
  }));

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase">Catalog</p>
          <h1 className="text-4xl font-black">{isOrdering ? "Arrange items" : "Items"}</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          {isOrdering ? <button type="button" onClick={() => setIsOrdering(false)} className="border border-items-blue px-5 py-3 font-black">Cancel</button> : <button type="button" onClick={() => setIsOrdering(true)} className="border border-items-blue px-5 py-3 font-black">Arrange items</button>}
          {!isOrdering ? <Link href="/admin/items/new" className="bg-items-blue px-5 py-3 font-black text-items-white">New item</Link> : null}
        </div>
      </div>
      {orderSaved ? <p role="status" className="mt-6 border border-items-blue p-3 font-bold">Item order saved.</p> : null}
      {isOrdering ? (
        <section className="mt-8">
          <p className="mb-5 max-w-2xl font-medium">This saved order controls the public items grid and the Shop All list in the site sidebar.</p>
          <ItemOrderForm items={activeItems} action={updateOrderAction} />
        </section>
      ) : (
        <div className="mt-8 overflow-x-auto border border-items-blue">
          <table className="w-full min-w-[760px] text-left">
            <thead className="border-b border-items-blue text-sm uppercase"><tr><th className="p-3">Item</th><th className="p-3">Artist</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3">State</th><th className="p-3" /></tr></thead>
            <tbody>{items.map((item) => <tr key={item.id} className="border-b border-items-blue last:border-0"><td className="p-3 font-bold">{item.name}<span className="ml-2 text-xs font-normal">/{item.slug}</span></td><td className="p-3">{item.artistName}</td><td className="p-3">{itemPriceLabel(item)}</td><td className="p-3">{item.stockCount}</td><td className="p-3">{item.archivedAt ? "Archived" : item.isPublished ? "Published" : "Draft"}</td><td className="p-3 text-right"><Link href={`/admin/items/${item.id}`} className="font-black underline">Edit</Link></td></tr>)}</tbody>
          </table>
        </div>
      )}
    </>
  );
}
