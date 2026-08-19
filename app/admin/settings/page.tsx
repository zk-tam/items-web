import { AdminHeader } from "@/components/admin/AdminHeader";
import { updateMainNavigationLabelsAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth/admin";
import { getMainNavigationLabels, MAIN_NAVIGATION_LABEL_MAX_LENGTH } from "@/lib/site-settings/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SettingsPageProps = {
  searchParams: Promise<{ saved?: string | string[] }>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const [admin, labels, params] = await Promise.all([requireAdmin(), getMainNavigationLabels(), searchParams]);
  const wasSaved = params.saved === "1";

  return (
    <>
      <AdminHeader admin={admin} />
      <main className="mx-auto max-w-3xl px-6 py-10 lg:px-10">
        <p className="text-sm font-bold uppercase">Website</p>
        <h1 className="mt-1 text-4xl font-black">Navigation labels</h1>
        <p className="mt-3 max-w-xl text-sm font-bold">These labels are rendered on the server, so visitors receive the configured navigation text in the first page render.</p>

        {wasSaved ? <p className="mt-6 border border-items-blue bg-items-blue px-4 py-3 font-black text-items-white">Navigation labels saved.</p> : null}

        <form action={updateMainNavigationLabelsAction} className="mt-8 grid gap-6 border border-items-blue p-6">
          <label className="grid gap-2 font-black">
            Shop All label
            <input className="border border-items-blue bg-transparent px-3 py-2 font-medium" defaultValue={labels.shopLabel} maxLength={MAIN_NAVIGATION_LABEL_MAX_LENGTH} name="shopLabel" required />
          </label>
          <label className="grid gap-2 font-black">
            Artists label
            <input className="border border-items-blue bg-transparent px-3 py-2 font-medium" defaultValue={labels.artistsLabel} maxLength={MAIN_NAVIGATION_LABEL_MAX_LENGTH} name="artistsLabel" required />
          </label>
          <button className="justify-self-start bg-items-blue px-5 py-3 font-black text-items-white" type="submit">Save labels</button>
        </form>
      </main>
    </>
  );
}
