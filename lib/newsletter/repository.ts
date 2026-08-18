import "server-only";

import { queryRow, queryRows } from "@/lib/db/postgres";

export type NewsletterSubscriber = {
  id: string;
  email: string;
  subscribedAt: Date;
};

export async function subscribeToNewsletter(email: string) {
  const row = await queryRow<{ email: string }>(
    `insert into newsletter_subscribers (email)
     values ($1)
     on conflict (email) do nothing
     returning email`,
    [email]
  );

  return Boolean(row);
}

export async function listNewsletterSubscribers() {
  return queryRows<NewsletterSubscriber>(
    `select id, email, subscribed_at as "subscribedAt"
     from newsletter_subscribers
     order by subscribed_at desc, email asc`
  );
}

export async function countNewsletterSubscribers() {
  const row = await queryRow<{ count: number }>(
    `select count(*)::integer as count from newsletter_subscribers`
  );
  return row?.count ?? 0;
}
