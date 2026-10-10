"use client";

import { useMemo, useState } from "react";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

type ItemOrderEntry = {
  id: string;
  name: string;
  artistName: string;
  imageUrl: string | null;
  isPublished: boolean;
};

type SortableItemProps = {
  item: ItemOrderEntry;
  position: number;
};

function SortableItem({ item, position }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <li ref={setNodeRef} style={style} className={`flex items-center gap-3 border border-items-blue p-3 ${isDragging ? "relative z-10 opacity-50" : ""}`}>
      <button type="button" {...attributes} {...listeners} aria-label={`Drag ${item.name} to position ${position}`} title="Drag to reorder" className="touch-none border border-items-blue p-2"><GripVertical aria-hidden className="h-5 w-5" /></button>
      <span className="w-7 text-center text-sm font-black text-items-blue" aria-hidden>{position}</span>
      {item.imageUrl ? (
        // Public storage URLs are not processed by next/image in the admin drag list.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.imageUrl} alt="" className="h-11 w-11 shrink-0 object-cover" />
      ) : <div aria-hidden className="grid h-11 w-11 shrink-0 place-items-center bg-items-placeholder text-sm font-black">{item.name.slice(0, 1)}</div>}
      <div className="min-w-0 flex-1">
        <p className="truncate font-black">{item.name}</p>
        <p className="truncate text-sm font-medium">{item.artistName}</p>
      </div>
      <span className={`shrink-0 border px-2 py-1 text-xs font-black ${item.isPublished ? "border-items-blue text-items-blue" : "border-current opacity-60"}`}>{item.isPublished ? "Published" : "Draft"}</span>
    </li>
  );
}

type ItemOrderFormProps = {
  items: ItemOrderEntry[];
  action: (formData: FormData) => void | Promise<void>;
};

export function ItemOrderForm({ items, action }: ItemOrderFormProps) {
  const [orderedItems, setOrderedItems] = useState(items);
  const [isSaving, setIsSaving] = useState(false);
  const initialIds = useMemo(() => items.map((item) => item.id), [items]);
  const orderedIds = orderedItems.map((item) => item.id);
  const hasChanges = orderedIds.some((id, index) => id !== initialIds[index]);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setOrderedItems((current) => {
      const from = current.findIndex((item) => item.id === active.id);
      const to = current.findIndex((item) => item.id === over.id);
      return from < 0 || to < 0 ? current : arrayMove(current, from, to);
    });
  }

  if (items.length === 0) return <p className="border border-dashed border-items-blue p-5 font-medium">No active items to arrange.</p>;

  return (
    <form action={action} onSubmit={() => setIsSaving(true)} className="grid max-w-3xl gap-5">
      <input type="hidden" name="itemIds" value={JSON.stringify(orderedIds)} />
      <p className="text-sm font-medium">Drag the handle to reorder. You can also focus a handle, press Space, then use the arrow keys to move an item.</p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={orderedIds} strategy={verticalListSortingStrategy}>
          <ol className="grid gap-2" aria-label="Item display order">
            {orderedItems.map((item, index) => <SortableItem key={item.id} item={item} position={index + 1} />)}
          </ol>
        </SortableContext>
      </DndContext>
      <div className="flex items-center gap-4">
        <button type="submit" disabled={!hasChanges || isSaving} className="bg-items-blue px-5 py-3 font-black text-items-white disabled:cursor-not-allowed disabled:opacity-50">{isSaving ? "Saving order…" : "Save order"}</button>
        {hasChanges ? <p className="text-sm font-bold text-items-blue">Unsaved changes</p> : <p className="text-sm font-medium">Saved order</p>}
      </div>
    </form>
  );
}
