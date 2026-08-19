create table if not exists site_settings (
  id boolean primary key default true check (id),
  shop_label text not null default 'Shop All' check (char_length(btrim(shop_label)) between 1 and 48),
  artists_label text not null default 'Artists' check (char_length(btrim(artists_label)) between 1 and 48),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into site_settings (id)
values (true)
on conflict (id) do nothing;

alter table site_settings enable row level security;

drop trigger if exists site_settings_set_updated_at on site_settings;
create trigger site_settings_set_updated_at before update on site_settings for each row execute function set_updated_at();
