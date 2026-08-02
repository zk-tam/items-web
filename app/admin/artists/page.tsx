import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { listAdminArtists } from "@/lib/admin/repository";
import { requireAdmin } from "@/lib/auth/admin";

export const runtime = "nodejs";

export default async function AdminArtistsPage() {
  const admin = await requireAdmin();
  const artists = await listAdminArtists();
  return (
    <><AdminHeader admin={admin} /><main className="mx-auto max-w-6xl px-6 py-10 lg:px-10"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase">Catalog</p><h1 className="text-4xl font-black">Artists</h1></div><Link href="/admin/artists/new" className="bg-items-blue px-5 py-3 font-black text-items-white">New artist</Link></div><div className="mt-8 overflow-x-auto border border-items-blue"><table className="w-full min-w-[700px] text-left"><thead className="border-b border-items-blue text-sm uppercase"><tr><th className="p-3">Artist</th><th className="p-3">Items</th><th className="p-3">Published</th><th className="p-3">State</th><th className="p-3" /></tr></thead><tbody>{artists.map((artist) => <tr key={artist.id} className="border-b border-items-blue last:border-0"><td className="p-3 font-bold">{artist.name}<span className="ml-2 text-xs font-normal">/{artist.slug}</span></td><td className="p-3">{artist.itemCount}</td><td className="p-3">{artist.isPublished ? "Yes" : "No"}</td><td className="p-3">{artist.archivedAt ? "Archived" : "Active"}</td><td className="p-3 text-right"><Link href={`/admin/artists/${artist.id}`} className="font-black underline">Edit</Link></td></tr>)}</tbody></table></div></main></>
  );
}
