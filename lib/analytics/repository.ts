import "server-only";

import type { AnalyticsDateRange } from "@/lib/analytics/definitions";
import { ANALYTICS_RETENTION_MONTHS } from "@/lib/analytics/definitions";
import { queryRow, queryRows } from "@/lib/db/postgres";

type AnalyticsSummaryRow = {
  pageViews: number;
  uniqueVisitors: number;
};

type AnalyticsPageRow = {
  pagePath: string;
  pageViews: number;
  uniqueVisitors: number;
};

type AnalyticsReferralRow = {
  referrerHost: string | null;
  pagePath: string;
  pageViews: number;
  uniqueVisitors: number;
};

type AnalyticsCountryRow = {
  countryCode: string | null;
  pageViews: number;
  uniqueVisitors: number;
};

export type AnalyticsReport = {
  summary: AnalyticsSummaryRow;
  pages: AnalyticsPageRow[];
  referrals: AnalyticsReferralRow[];
  countries: AnalyticsCountryRow[];
};

export async function recordAnalyticsPageView(input: {
  eventId: string;
  visitorHash: string;
  pagePath: string;
  referrerHost: string | null;
  countryCode: string | null;
  isLanding: boolean;
}) {
  const row = await queryRow<{ eventId: string }>(
    `insert into analytics_page_views (event_id, visitor_hash, page_path, referrer_host, country_code, is_landing)
     values ($1, $2, $3, $4, $5, $6)
     on conflict (event_id) do nothing
     returning event_id as "eventId"`,
    [input.eventId, input.visitorHash, input.pagePath, input.referrerHost, input.countryCode, input.isLanding]
  );
  return Boolean(row);
}

export async function getAnalyticsReport(range: AnalyticsDateRange): Promise<AnalyticsReport> {
  const values = [range.from, range.until];
  const [summary, pages, referrals, countries] = await Promise.all([
    queryRow<AnalyticsSummaryRow>(
      `select count(*)::integer as "pageViews", count(distinct visitor_hash)::integer as "uniqueVisitors"
       from analytics_page_views
       where occurred_at >= $1 and occurred_at < $2`,
      values
    ),
    queryRows<AnalyticsPageRow>(
      `select page_path as "pagePath", count(*)::integer as "pageViews", count(distinct visitor_hash)::integer as "uniqueVisitors"
       from analytics_page_views
       where occurred_at >= $1 and occurred_at < $2
       group by page_path
       order by count(*) desc, page_path asc
       limit 200`,
      values
    ),
    queryRows<AnalyticsReferralRow>(
      `select referrer_host as "referrerHost", page_path as "pagePath", count(*)::integer as "pageViews", count(distinct visitor_hash)::integer as "uniqueVisitors"
       from analytics_page_views
       where occurred_at >= $1 and occurred_at < $2 and is_landing = true
       group by referrer_host, page_path
       order by count(*) desc, referrer_host nulls last, page_path asc
       limit 200`,
      values
    ),
    queryRows<AnalyticsCountryRow>(
      `select country_code as "countryCode", count(*)::integer as "pageViews", count(distinct visitor_hash)::integer as "uniqueVisitors"
       from analytics_page_views
       where occurred_at >= $1 and occurred_at < $2
       group by country_code
       order by count(*) desc, country_code nulls last
       limit 200`,
      values
    )
  ]);

  return {
    summary: summary ?? { pageViews: 0, uniqueVisitors: 0 },
    pages,
    referrals,
    countries
  };
}

export async function deleteExpiredAnalyticsPageViews() {
  const row = await queryRow<{ deletedCount: number }>(
    `with deleted as (
       delete from analytics_page_views
       where occurred_at < now() - make_interval(months => $1)
       returning 1
     )
     select count(*)::integer as "deletedCount" from deleted`,
    [ANALYTICS_RETENTION_MONTHS]
  );
  return row?.deletedCount ?? 0;
}
