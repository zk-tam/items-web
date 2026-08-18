import { AdminHeader } from "@/components/admin/AdminHeader";
import { requireAdmin } from "@/lib/auth/admin";
import { listNewsletterSubscribers } from "@/lib/newsletter/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en-MY", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kuala_Lumpur"
});

export default async function NewsletterSubscribersPage() {
  const admin = await requireAdmin();
  const subscribers = await listNewsletterSubscribers();

  return (
    <>
      <AdminHeader admin={admin} />
      <main className="mx-auto max-w-6xl px-6 py-10 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase">Audience</p>
            <h1 className="text-4xl font-black">Newsletter</h1>
            <p className="mt-2 text-sm font-bold">{subscribers.length} subscriber{subscribers.length === 1 ? "" : "s"}</p>
          </div>
          <a href="/admin/newsletter/export" className="bg-items-blue px-5 py-3 font-black text-items-white">Export CSV</a>
        </div>

        <div className="mt-8 overflow-x-auto border border-items-blue">
          <table className="w-full min-w-[620px] text-left">
            <thead className="border-b border-items-blue text-sm uppercase">
              <tr><th className="p-3">Email</th><th className="p-3">Subscribed</th></tr>
            </thead>
            <tbody>
              {subscribers.length > 0 ? subscribers.map((subscriber) => (
                <tr key={subscriber.id} className="border-b border-items-blue last:border-0">
                  <td className="p-3 font-bold">{subscriber.email}</td>
                  <td className="p-3">{dateFormatter.format(subscriber.subscribedAt)} MYT</td>
                </tr>
              )) : (
                <tr><td className="p-3" colSpan={2}>No newsletter subscribers yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
