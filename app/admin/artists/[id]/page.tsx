import Link from "next/link";
import { archiveArtistAction, updateArtistAction } from "@/app/admin/actions";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ArtistForm } from "@/components/admin/ArtistForm";
import { getAdminArtist } from "@/lib/admin/repository";
import { requireAdmin } from "@/lib/auth/admin";
import { getStoragePublicUrl } from "@/lib/storage/supabase-storage";
import { notFound } from "next/navigation";

type ArtistPageProps = { params: Promise<{ id: string }> };

export default async function EditArtistPage({ params }: ArtistPageProps) {
  const admin = await requireAdmin();
  const { id } = await params;
  const artist = await getAdminArtist(id);
  if (!artist) notFound();
  const profileImageUrl = artist.profileImagePath ? getStoragePublicUrl(artist.profileImagePath) : null;
  const existingMedia = artist.media.map((media) => ({ ...media, publicUrl: getStoragePublicUrl(media.storagePath) }));
  return <><AdminHeader admin={admin} /><main className="mx-auto max-w-6xl px-6 py-10 lg:px-10"><Link href="/admin/artists" className="font-bold underline">← Artists</Link><h1 className="mb-8 mt-4 text-4xl font-black">Edit {artist.name}</h1><ArtistForm artist={artist} profileImageUrl={profileImageUrl} existingMedia={existingMedia} action={updateArtistAction.bind(null, id)} />{!artist.archivedAt ? <form action={archiveArtistAction.bind(null, id)} className="mt-10"><button className="border border-red-600 px-4 py-2 font-black text-red-700">Archive artist</button></form> : null}</main></>;
}
