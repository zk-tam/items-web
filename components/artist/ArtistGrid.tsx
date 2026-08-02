"use client";

import type { CatalogArtist as Artist } from "@/lib/catalog/types";
import { ArtistCard } from "@/components/artist/ArtistCard";

type ArtistGridProps = {
  artists: Artist[];
};

export function ArtistGrid({ artists }: ArtistGridProps) {
  return (
    <main aria-label="Artists" className="grid items-stretch gap-12 lg:grid-cols-4 lg:gap-x-7 lg:gap-y-12">
      {artists.map((artist, index) => (
        <ArtistCard key={artist.slug} artist={artist} priority={index < 4} />
      ))}
    </main>
  );
}
