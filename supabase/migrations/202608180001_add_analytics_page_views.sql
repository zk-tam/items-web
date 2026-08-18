create table if not exists analytics_page_views (
  event_id uuid primary key,
  visitor_hash char(64) not null,
  page_path text not null check (char_length(page_path) <= 1024 and page_path ~ '^/' and page_path !~ '[?#]'),
  referrer_host text check (referrer_host is null or (char_length(referrer_host) <= 253 and referrer_host = lower(referrer_host))),
  is_landing boolean not null,
  occurred_at timestamptz not null default now(),
  check (is_landing or referrer_host is null)
);

create index if not exists analytics_page_views_occurred_at_idx on analytics_page_views (occurred_at desc);
create index if not exists analytics_page_views_page_occurred_at_idx on analytics_page_views (page_path, occurred_at desc);
create index if not exists analytics_page_views_referrer_occurred_at_idx on analytics_page_views (referrer_host, occurred_at desc) where is_landing;

alter table analytics_page_views enable row level security;
