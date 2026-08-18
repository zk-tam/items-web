create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email) and char_length(email) <= 254),
  subscribed_at timestamptz not null default now()
);

create index if not exists newsletter_subscribers_subscribed_at_idx
  on newsletter_subscribers (subscribed_at desc);

alter table newsletter_subscribers enable row level security;
