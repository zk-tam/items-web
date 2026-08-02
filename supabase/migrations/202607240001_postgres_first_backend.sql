-- Upgrade the original catalog-only schema without discarding existing data.
-- Run this once for an existing deployment. Fresh deployments use ../schema.sql.
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'artists')
    and not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'artists' and column_name = 'id') then
    alter table public.artists rename to legacy_artists;
  end if;
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'products')
    and not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'products' and column_name = 'id') then
    alter table public.products rename to legacy_products;
  end if;
end $$;

-- The remainder intentionally mirrors the fresh-install schema. It is kept
-- idempotent so installations can migrate from the original public tables.
create extension if not exists pgcrypto;
do $$ begin create type order_status as enum ('draft', 'awaiting_payment', 'processing', 'shipped', 'completed', 'cancelled'); exception when duplicate_object then null; end $$;
do $$ begin create type payment_status as enum ('unpaid', 'paid', 'refunded'); exception when duplicate_object then null; end $$;
do $$ begin create type document_kind as enum ('invoice', 'receipt'); exception when duplicate_object then null; end $$;

create table if not exists artists (
  id uuid primary key default gen_random_uuid(), slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'), name text not null, role text, description text, email text, website_url text,
  profile_image_path text, profile_image_alt text, initially_expanded boolean not null default false, is_published boolean not null default true, archived_at timestamptz,
  sort_order integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists artist_links (id uuid primary key default gen_random_uuid(), artist_id uuid not null references artists(id) on delete cascade, label text not null, url text not null, sort_order integer not null default 0, created_at timestamptz not null default now());
create table if not exists items (
  id uuid primary key default gen_random_uuid(), artist_id uuid not null references artists(id) on delete restrict, slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'), name text not null, description text not null,
  preview jsonb, specs jsonb not null default '[]'::jsonb, size text, category text, price_cents integer not null default 0 check (price_cents >= 0), currency char(3) not null default 'MYR', stock_count integer not null default 0 check (stock_count >= 0),
  order_message text, is_published boolean not null default true, archived_at timestamptz, sort_order integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists item_images (id uuid primary key default gen_random_uuid(), item_id uuid not null references items(id) on delete cascade, storage_path text not null unique, alt_text text, sort_order integer not null default 0, created_at timestamptz not null default now());
create sequence if not exists order_number_seq start with 1000;
create table if not exists orders (
  id uuid primary key default gen_random_uuid(), order_number text not null unique default ('ORD-' || lpad(nextval('order_number_seq')::text, 6, '0')), customer_name text not null, customer_email text, customer_phone text, shipping_address text,
  status order_status not null default 'draft', payment_status payment_status not null default 'unpaid', paid_at timestamptz, shipment_url text, notes text, stock_committed boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), check (shipment_url is null or shipment_url ~ '^https?://')
);
create table if not exists order_lines (id uuid primary key default gen_random_uuid(), order_id uuid not null references orders(id) on delete cascade, item_id uuid not null references items(id) on delete restrict, item_name text not null, artist_name text not null, quantity integer not null check (quantity > 0), unit_price_cents integer not null check (unit_price_cents >= 0), created_at timestamptz not null default now());
create sequence if not exists invoice_number_seq start with 1000;
create sequence if not exists receipt_number_seq start with 1000;
create table if not exists order_documents (id uuid primary key default gen_random_uuid(), order_id uuid not null references orders(id) on delete restrict, kind document_kind not null, document_number text not null unique, snapshot jsonb not null, generated_at timestamptz not null default now(), unique (order_id, kind));
create table if not exists admin_users (id uuid primary key default gen_random_uuid(), email text not null unique, password_hash text not null, is_active boolean not null default true, last_login_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), check (email = lower(email)));
create table if not exists admin_sessions (id uuid primary key default gen_random_uuid(), admin_user_id uuid not null references admin_users(id) on delete cascade, token_hash char(64) not null unique, expires_at timestamptz not null, revoked_at timestamptz, created_at timestamptz not null default now());
create index if not exists artists_catalog_idx on artists (is_published, archived_at, sort_order, name);
create index if not exists items_catalog_idx on items (artist_id, is_published, archived_at, sort_order, name);
create index if not exists item_images_item_idx on item_images (item_id, sort_order);
create index if not exists artist_links_artist_idx on artist_links (artist_id, sort_order);
create index if not exists orders_admin_idx on orders (created_at desc);
create index if not exists order_lines_order_idx on order_lines (order_id);
create index if not exists admin_sessions_active_idx on admin_sessions (token_hash, expires_at) where revoked_at is null;
alter table artists enable row level security;
alter table artist_links enable row level security;
alter table items enable row level security;
alter table item_images enable row level security;
alter table orders enable row level security;
alter table order_lines enable row level security;
alter table order_documents enable row level security;
alter table admin_users enable row level security;
alter table admin_sessions enable row level security;
create or replace function set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
drop trigger if exists artists_set_updated_at on artists; create trigger artists_set_updated_at before update on artists for each row execute function set_updated_at();
drop trigger if exists items_set_updated_at on items; create trigger items_set_updated_at before update on items for each row execute function set_updated_at();
drop trigger if exists orders_set_updated_at on orders; create trigger orders_set_updated_at before update on orders for each row execute function set_updated_at();
drop trigger if exists admin_users_set_updated_at on admin_users; create trigger admin_users_set_updated_at before update on admin_users for each row execute function set_updated_at();

do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'legacy_artists') then
    insert into artists (slug, name, role, description, profile_image_path, profile_image_alt, initially_expanded, sort_order, created_at)
    select slug, name, role, bio, image, image_alt, initially_expanded, sort_order, created_at from legacy_artists
    on conflict (slug) do nothing;
    insert into artist_links (artist_id, label, url, sort_order)
    select a.id, link.label, link.href, 0
    from legacy_artists legacy
    join artists a on a.slug = legacy.slug
    cross join lateral jsonb_to_recordset(coalesce(legacy.links, '[]'::jsonb)) as link(label text, href text)
    where not exists (
      select 1 from artist_links existing where existing.artist_id = a.id and existing.label = link.label and existing.url = link.href
    );
  end if;
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'legacy_products') then
    insert into items (slug, artist_id, name, description, preview, specs, size, order_message, sort_order, created_at)
    select product.slug, artist.id, product.name, product.description, product.preview, product.specs, product.size, product.order_message, product.sort_order, product.created_at
    from legacy_products product join artists artist on artist.slug = product.artist_slug
    on conflict (slug) do nothing;
    insert into item_images (item_id, storage_path, alt_text, sort_order)
    select item.id, image.src, image.alt, 0
    from legacy_products product
    join items item on item.slug = product.slug
    cross join lateral jsonb_to_recordset(coalesce(product.images, '[]'::jsonb)) as image(src text, alt text)
    on conflict (storage_path) do nothing;
  end if;
end $$;

insert into storage.buckets (id, name, public) values ('catalog-images', 'catalog-images', true) on conflict (id) do update set public = true;
