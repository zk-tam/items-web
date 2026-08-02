import Link from "next/link";
import { createArtistAction } from "@/app/admin/actions";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ArtistForm } from "@/components/admin/ArtistForm";
import { requireAdmin } from "@/lib/auth/admin";

export default async function NewArtistPage() {
  const admin = await requireAdmin();
  return <><AdminHeader admin={admin} /><main className="mx-auto max-w-6xl px-6 py-10 lg:px-10"><Link href="/admin/artists" className="font-bold underline">← Artists</Link><h1 className="mb-8 mt-4 text-4xl font-black">New artist</h1><ArtistForm action={createArtistAction} /></main></>;
}
