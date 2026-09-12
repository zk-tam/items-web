import { updateArtistOrderAction } from "@/app/admin/actions";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ArtistsManagement } from "@/components/admin/ArtistsManagement";
import { listAdminArtists } from "@/lib/admin/repository";
import { requireAdmin } from "@/lib/auth/admin";
import { getStoragePublicUrl } from "@/lib/storage/supabase-storage";

export const runtime = "nodejs";

type AdminArtistsPageProps = { searchParams: Promise<{ order?: string }> };

export default async function AdminArtistsPage({ searchParams }: AdminArtistsPageProps) {
  const [admin, artists, params] = await Promise.all([requireAdmin(), listAdminArtists(), searchParams]);
  const artistEntries = artists.map((artist) => ({
    ...artist,
    profileImageUrl: artist.profileImagePath ? getStoragePublicUrl(artist.profileImagePath) : null
  }));
  return (
    <><AdminHeader admin={admin} /><main className="mx-auto max-w-6xl px-6 py-10 lg:px-10"><ArtistsManagement artists={artistEntries} orderSaved={params.order === "saved"} updateOrderAction={updateArtistOrderAction} /></main></>
  );
}
