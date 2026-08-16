"use client";

import type { CatalogArtist as Artist } from "@/lib/catalog/types";
import { ArtistCard } from "@/components/artist/ArtistCard";

type ArtistGridProps = {
  artists: Artist[];
};

export function ArtistGrid({ artists }: ArtistGridProps) {
  const columns = Array.from({ length: 4 }, () => Array<{ artist: Artist; index: number }>());

  artists.forEach((artist, index) => {
    columns[index % columns.length].push({ artist, index });
  });

  return (
    <main aria-label="Artists" className="grid gap-12 lg:grid-cols-4 lg:items-start lg:gap-x-7 lg:gap-y-0">
      {columns.map((column, columnIndex) => (
        <div key={columnIndex} className="contents lg:flex lg:flex-col lg:gap-12">
          {column.map(({ artist, index }) => (
            <div key={artist.slug} style={{ order: index }}>
              <ArtistCard artist={artist} priority={index < 4} />
            </div>
          ))}
        </div>
      ))}
    </main>
  );
}
