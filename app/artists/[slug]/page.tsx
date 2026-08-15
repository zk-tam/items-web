import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArtistDetail } from "@/components/artist/ArtistDetail";
import { SiteShell } from "@/components/layout/SiteShell";
import { getArtistBySlug, listProductsByArtistSlug } from "@/lib/db/items-repository";
import { artistMetadata } from "@/lib/seo/catalog-metadata";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ArtistPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: ArtistPageProps): Promise<Metadata> {
  const { slug } = await params;
  const artist = await getArtistBySlug(slug);

  if (!artist) {
    return {
      title: "Artist not found"
    };
  }

  return artistMetadata(artist);
}

export default async function ArtistPage({ params }: ArtistPageProps) {
  const { slug } = await params;
  const [artist, products] = await Promise.all([getArtistBySlug(slug), listProductsByArtistSlug(slug)]);

  if (!artist) {
    notFound();
  }

  return (
    <SiteShell activeRoute="artists" detailHeader>
      <ArtistDetail artist={artist} products={products} />
    </SiteShell>
  );
}
