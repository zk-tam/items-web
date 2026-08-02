import { OrderLineEditor } from "@/components/admin/OrderLineEditor";

type ItemOption = { id: string; name: string; artistName: string; priceCents: number; stockCount: number };

export function OrderForm({ items, action }: { items: ItemOption[]; action: (formData: FormData) => void | Promise<void> }) {
  return (
    <form action={action} className="grid max-w-3xl gap-5">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-1 font-bold">Customer name<input name="customerName" required className="border border-items-blue bg-transparent p-3" /></label>
        <label className="grid gap-1 font-bold">Customer email<input name="customerEmail" type="email" className="border border-items-blue bg-transparent p-3" /></label>
      </div>
      <label className="grid gap-1 font-bold">Customer phone<input name="customerPhone" type="tel" className="border border-items-blue bg-transparent p-3" /></label>
      <label className="grid gap-1 font-bold">Shipping address<textarea name="shippingAddress" rows={3} className="border border-items-blue bg-transparent p-3" /></label>
      <label className="grid gap-1 font-bold">Items<OrderLineEditor items={items} /></label>
      <label className="grid gap-1 font-bold">Internal notes<textarea name="notes" rows={4} className="border border-items-blue bg-transparent p-3" /></label>
      <button className="w-fit bg-items-blue px-5 py-3 font-black text-items-white">Create order</button>
    </form>
  );
}
