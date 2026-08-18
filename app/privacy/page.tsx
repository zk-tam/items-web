import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AnalyticsPreferences } from "@/components/analytics/AnalyticsPreferences";
import { SiteShell } from "@/components/layout/SiteShell";
import { ANALYTICS_OPT_OUT_COOKIE } from "@/lib/analytics/definitions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Privacy & Analytics"
};

export default async function PrivacyPage() {
  const cookieStore = await cookies();
  const analyticsEnabled = cookieStore.get(ANALYTICS_OPT_OUT_COOKIE)?.value !== "1";

  return (
    <SiteShell lockDesktopViewport>
      <main className="max-w-[900px] space-y-8 pt-3 text-[13px] font-medium lg:pt-0">
        <section className="space-y-5">
          <h1 className="font-heavy">Privacy & analytics</h1>
          <div className="space-y-4">
            <p>ITEMS uses first-party, anonymous analytics to understand which pages are visited and which external websites lead people here.</p>
            <p>We use a random browser identifier to count returning visitors. We derive a two-letter country code from your IP address but never store the IP itself. We also do not store your name, email address, user agent, or a referrer&apos;s full URL.</p>
            <p>Analytics data is retained for up to 13 months. You can disable analytics below at any time for this browser.</p>
          </div>
        </section>
        <AnalyticsPreferences initialEnabled={analyticsEnabled} />
      </main>
    </SiteShell>
  );
}
