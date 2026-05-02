import type { Metadata } from "next";
import { ArtistGrid } from "@/components/artist/ArtistGrid";
import { SiteShell } from "@/components/layout/SiteShell";
import type { ArtistMenuItem } from "@/data/navigation";
import { listArtists } from "@/lib/db/items-repository";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Artists"
};

export default async function ArtistsPage() {
  const artists = await listArtists();
  const artistMenuItems: ArtistMenuItem[] = artists.map((artist) => ({
    name: artist.name,
    href: `/artists/${artist.slug}`
  }));

  return (
    <SiteShell activeRoute="artists" artistMenuExpanded artistMenuItems={artistMenuItems}>
      <ArtistGrid artists={artists} />
    </SiteShell>
  );
}
