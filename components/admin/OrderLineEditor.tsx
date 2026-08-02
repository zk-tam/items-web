"use client";

import { useState } from "react";

type ItemOption = { id: string; name: string; artistName: string; priceCents: number; stockCount: number };

export function OrderLineEditor({ items }: { items: ItemOption[] }) {
  const [lineIds, setLineIds] = useState([0]);
  if (items.length === 0) return <p className="border border-items-blue p-3 font-bold">Create an item before creating an order.</p>;
  return (
    <div className="grid gap-3">
      {lineIds.map((lineId) => (
        <div key={lineId} className="grid gap-3 md:grid-cols-[minmax(0,1fr)_110px_auto]">
          <select name="itemIds" required className="border border-items-blue bg-transparent p-3">
            <option value="">Select item</option>
            {items.map((item) => <option key={item.id} value={item.id}>{item.name} — {item.artistName} (MYR {(item.priceCents / 100).toFixed(2)}, stock {item.stockCount})</option>)}
          </select>
          <input name="quantities" type="number" min="1" defaultValue="1" required className="border border-items-blue bg-transparent p-3" aria-label="Quantity" />
          <button type="button" onClick={() => setLineIds((current) => current.length === 1 ? current : current.filter((id) => id !== lineId))} className="border border-items-blue px-3 py-2 font-bold">Remove</button>
        </div>
      ))}
      <button type="button" onClick={() => setLineIds((current) => [...current, Math.max(...current) + 1])} className="w-fit border border-items-blue px-3 py-2 font-bold">Add item</button>
    </div>
  );
}
