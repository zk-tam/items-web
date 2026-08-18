import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { getAnalyticsDateRange } from "@/lib/analytics/definitions";
import { getAnalyticsReport } from "@/lib/analytics/repository";
import { requireAdmin } from "@/lib/auth/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AnalyticsPageProps = {
  searchParams: Promise<{
    from?: string | string[];
    to?: string | string[];
  }>;
};

function firstValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

function rangeHref(days: number, today: string) {
  const [year, month, day] = today.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() - (days - 1));
  const from = date.toISOString().slice(0, 10);
  return `/admin/analytics?from=${from}&to=${today}`;
}

function number(value: number) {
  return new Intl.NumberFormat("en-MY").format(value);
}

function countryLabel(countryCode: string | null) {
  if (!countryCode) return "Unknown";
  try {
    return `${new Intl.DisplayNames(["en"], { type: "region" }).of(countryCode) ?? countryCode} (${countryCode})`;
  } catch {
    return countryCode;
  }
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const [admin, params] = await Promise.all([requireAdmin(), searchParams]);
  const range = getAnalyticsDateRange(firstValue(params.from), firstValue(params.to));
  const report = await getAnalyticsReport(range);

  return (
    <>
      <AdminHeader admin={admin} />
      <main className="mx-auto max-w-6xl px-6 py-10 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase">User analysis</p>
            <h1 className="text-4xl font-black">Analytics</h1>
          </div>
          <p className="text-sm font-bold">{range.fromDate} — {range.toDate} MYT</p>
        </div>

        <form className="mt-8 flex flex-wrap items-end gap-4 border border-items-blue p-4" method="get">
          <label className="grid gap-2 text-sm font-bold">From<input className="border border-items-blue bg-transparent px-3 py-2" defaultValue={range.fromDate} name="from" type="date" /></label>
          <label className="grid gap-2 text-sm font-bold">To<input className="border border-items-blue bg-transparent px-3 py-2" defaultValue={range.toDate} name="to" type="date" /></label>
          <button className="bg-items-blue px-4 py-2 font-black text-items-white" type="submit">Apply</button>
          <div className="flex gap-3 text-sm font-black">
            {[7, 30, 90].map((days) => <Link key={days} href={rangeHref(days, range.toDate)}>{days} days</Link>)}
          </div>
        </form>

        <section className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="border border-items-blue p-5"><p className="text-sm font-bold uppercase">Unique visitors</p><p className="mt-3 text-5xl font-black">{number(report.summary.uniqueVisitors)}</p></div>
          <div className="border border-items-blue p-5"><p className="text-sm font-bold uppercase">Page views</p><p className="mt-3 text-5xl font-black">{number(report.summary.pageViews)}</p></div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-black">Pages</h2>
          <div className="mt-4 overflow-x-auto border border-items-blue">
            <table className="w-full min-w-[620px] text-left"><thead className="border-b border-items-blue text-sm uppercase"><tr><th className="p-3">Page</th><th className="p-3">Page views</th><th className="p-3">Unique visitors</th></tr></thead><tbody>{report.pages.length > 0 ? report.pages.map((page) => <tr key={page.pagePath} className="border-b border-items-blue last:border-0"><td className="p-3 font-bold">{page.pagePath}</td><td className="p-3">{number(page.pageViews)}</td><td className="p-3">{number(page.uniqueVisitors)}</td></tr>) : <tr><td className="p-3" colSpan={3}>No page views in this range.</td></tr>}</tbody></table>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-black">Referral sources</h2>
          <p className="mt-2 text-sm font-bold">Sources are credited to the page where the visit started.</p>
          <div className="mt-4 overflow-x-auto border border-items-blue">
            <table className="w-full min-w-[760px] text-left"><thead className="border-b border-items-blue text-sm uppercase"><tr><th className="p-3">Source</th><th className="p-3">Landing page</th><th className="p-3">Landing views</th><th className="p-3">Unique visitors</th></tr></thead><tbody>{report.referrals.length > 0 ? report.referrals.map((referral) => <tr key={`${referral.referrerHost ?? "direct"}-${referral.pagePath}`} className="border-b border-items-blue last:border-0"><td className="p-3 font-bold">{referral.referrerHost ?? "Direct / unknown"}</td><td className="p-3">{referral.pagePath}</td><td className="p-3">{number(referral.pageViews)}</td><td className="p-3">{number(referral.uniqueVisitors)}</td></tr>) : <tr><td className="p-3" colSpan={4}>No landing visits in this range.</td></tr>}</tbody></table>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-black">Countries</h2>
          <p className="mt-2 text-sm font-bold">Country codes are derived by Vercel from the visitor&apos;s IP address; raw IP addresses are not retained.</p>
          <div className="mt-4 overflow-x-auto border border-items-blue">
            <table className="w-full min-w-[620px] text-left"><thead className="border-b border-items-blue text-sm uppercase"><tr><th className="p-3">Country</th><th className="p-3">Page views</th><th className="p-3">Unique visitors</th></tr></thead><tbody>{report.countries.length > 0 ? report.countries.map((country) => <tr key={country.countryCode ?? "unknown"} className="border-b border-items-blue last:border-0"><td className="p-3 font-bold">{countryLabel(country.countryCode)}</td><td className="p-3">{number(country.pageViews)}</td><td className="p-3">{number(country.uniqueVisitors)}</td></tr>) : <tr><td className="p-3" colSpan={3}>No country data in this range.</td></tr>}</tbody></table>
          </div>
        </section>
      </main>
    </>
  );
}
