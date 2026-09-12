"use client";

import Link from "next/link";
import { useState } from "react";
import { ArtistOrderForm } from "@/components/admin/ArtistOrderForm";

type ArtistListEntry = {
  id: string;
  slug: string;
  name: string;
  role: string | null;
  profileImageUrl: string | null;
  isPublished: boolean;
  archivedAt: Date | string | null;
  itemCount?: number;
};

type ArtistsManagementProps = {
  artists: ArtistListEntry[];
  orderSaved: boolean;
  updateOrderAction: (formData: FormData) => void | Promise<void>;
};

export function ArtistsManagement({ artists, orderSaved, updateOrderAction }: ArtistsManagementProps) {
  const [isOrdering, setIsOrdering] = useState(false);
  const activeArtists = artists.filter((artist) => !artist.archivedAt).map((artist) => ({
    id: artist.id,
    name: artist.name,
    role: artist.role,
    imageUrl: artist.profileImageUrl,
    isPublished: artist.isPublished
  }));

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase">Catalog</p>
          <h1 className="text-4xl font-black">{isOrdering ? "Arrange artists" : "Artists"}</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          {isOrdering ? <button type="button" onClick={() => setIsOrdering(false)} className="border border-items-blue px-5 py-3 font-black">Cancel</button> : <button type="button" onClick={() => setIsOrdering(true)} className="border border-items-blue px-5 py-3 font-black">Arrange artists</button>}
          {!isOrdering ? <Link href="/admin/artists/new" className="bg-items-blue px-5 py-3 font-black text-items-white">New artist</Link> : null}
        </div>
      </div>
      {orderSaved ? <p role="status" className="mt-6 border border-items-blue p-3 font-bold">Artist order saved.</p> : null}
      {isOrdering ? (
        <section className="mt-8">
          <p className="mb-5 max-w-2xl font-medium">This saved order controls both the public artists grid and the Artists list in the site sidebar.</p>
          <ArtistOrderForm artists={activeArtists} action={updateOrderAction} />
        </section>
      ) : (
        <div className="mt-8 overflow-x-auto border border-items-blue">
          <table className="w-full min-w-[700px] text-left">
            <thead className="border-b border-items-blue text-sm uppercase"><tr><th className="p-3">Artist</th><th className="p-3">Items</th><th className="p-3">Published</th><th className="p-3">State</th><th className="p-3" /></tr></thead>
            <tbody>{artists.map((artist) => <tr key={artist.id} className="border-b border-items-blue last:border-0"><td className="p-3 font-bold">{artist.name}<span className="ml-2 text-xs font-normal">/{artist.slug}</span></td><td className="p-3">{artist.itemCount}</td><td className="p-3">{artist.isPublished ? "Yes" : "No"}</td><td className="p-3">{artist.archivedAt ? "Archived" : "Active"}</td><td className="p-3 text-right"><Link href={`/admin/artists/${artist.id}`} className="font-black underline">Edit</Link></td></tr>)}</tbody>
          </table>
        </div>
      )}
    </>
  );
}
