alter table items
  add column if not exists myr_price_cents integer check (myr_price_cents >= 0),
  add column if not exists usd_price_cents integer check (usd_price_cents >= 0);

update items
set
  myr_price_cents = case when currency = 'MYR' then price_cents else null end,
  usd_price_cents = case when currency = 'USD' then price_cents else null end
where myr_price_cents is null
  and usd_price_cents is null;
