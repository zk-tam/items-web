"use client";

import { useMemo, useState } from "react";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

type ArtistOrderEntry = {
  id: string;
  name: string;
  role: string | null;
  imageUrl: string | null;
  isPublished: boolean;
};

type SortableArtistProps = {
  artist: ArtistOrderEntry;
  position: number;
};

function SortableArtist({ artist, position }: SortableArtistProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: artist.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <li ref={setNodeRef} style={style} className={`flex items-center gap-3 border border-items-blue p-3 ${isDragging ? "relative z-10 opacity-50" : ""}`}>
      <button type="button" {...attributes} {...listeners} aria-label={`Drag ${artist.name} to position ${position}`} title="Drag to reorder" className="touch-none border border-items-blue p-2"><GripVertical aria-hidden className="h-5 w-5" /></button>
      <span className="w-7 text-center text-sm font-black text-items-blue" aria-hidden>{position}</span>
      {artist.imageUrl ? (
        // Public storage URLs are not processed by next/image in the admin drag list.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={artist.imageUrl} alt="" className="h-11 w-11 shrink-0 object-cover" />
      ) : <div aria-hidden className="grid h-11 w-11 shrink-0 place-items-center bg-items-placeholder text-sm font-black">{artist.name.slice(0, 1)}</div>}
      <div className="min-w-0 flex-1">
        <p className="truncate font-black">{artist.name}</p>
        <p className="truncate text-sm font-medium">{artist.role || "Artist"}</p>
      </div>
      <span className={`shrink-0 border px-2 py-1 text-xs font-black ${artist.isPublished ? "border-items-blue text-items-blue" : "border-current opacity-60"}`}>{artist.isPublished ? "Published" : "Hidden"}</span>
    </li>
  );
}

type ArtistOrderFormProps = {
  artists: ArtistOrderEntry[];
  action: (formData: FormData) => void | Promise<void>;
};

export function ArtistOrderForm({ artists, action }: ArtistOrderFormProps) {
  const [orderedArtists, setOrderedArtists] = useState(artists);
  const [isSaving, setIsSaving] = useState(false);
  const initialIds = useMemo(() => artists.map((artist) => artist.id), [artists]);
  const orderedIds = orderedArtists.map((artist) => artist.id);
  const hasChanges = orderedIds.some((id, index) => id !== initialIds[index]);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setOrderedArtists((current) => {
      const from = current.findIndex((artist) => artist.id === active.id);
      const to = current.findIndex((artist) => artist.id === over.id);
      return from < 0 || to < 0 ? current : arrayMove(current, from, to);
    });
  }

  if (artists.length === 0) return <p className="border border-dashed border-items-blue p-5 font-medium">No active artists to arrange.</p>;

  return (
    <form action={action} onSubmit={() => setIsSaving(true)} className="grid max-w-3xl gap-5">
      <input type="hidden" name="artistIds" value={JSON.stringify(orderedIds)} />
      <p className="text-sm font-medium">Drag the handle to reorder. You can also focus a handle, press Space, then use the arrow keys to move an artist.</p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={orderedIds} strategy={verticalListSortingStrategy}>
          <ol className="grid gap-2" aria-label="Artist display order">
            {orderedArtists.map((artist, index) => <SortableArtist key={artist.id} artist={artist} position={index + 1} />)}
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
