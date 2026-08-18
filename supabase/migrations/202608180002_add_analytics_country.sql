alter table analytics_page_views
  add column if not exists country_code char(2)
    check (country_code is null or country_code ~ '^[A-Z]{2}$');

create index if not exists analytics_page_views_country_occurred_at_idx on analytics_page_views (country_code, occurred_at desc);
