-- Fresh-install schema for the ITEMS application. Database access is performed
-- by the server through `pg`; no browser client has table access.
create extension if not exists pgcrypto;

do $$
begin
  create type order_status as enum ('draft', 'awaiting_payment', 'processing', 'shipped', 'completed', 'cancelled');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type payment_status as enum ('unpaid', 'paid', 'refunded');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type document_kind as enum ('invoice', 'receipt');
exception when duplicate_object then null;
end $$;

create table if not exists artists (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null,
  role text,
  description text,
  seo_title text check (seo_title is null or char_length(seo_title) <= 70),
  seo_description text check (seo_description is null or char_length(seo_description) <= 160),
  email text,
  website_url text,
  profile_image_path text,
  profile_image_alt text,
  initially_expanded boolean not null default false,
  is_published boolean not null default true,
  archived_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists artist_links (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references artists(id) on delete cascade,
  label text not null,
  url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists artist_media (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references artists(id) on delete cascade,
  storage_path text not null unique,
  media_type text not null check (media_type in ('image', 'video')),
  mime_type text not null check (
    (media_type = 'image' and mime_type in ('image/jpeg', 'image/png', 'image/webp', 'image/gif'))
    or (media_type = 'video' and mime_type = 'video/mp4')
  ),
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references artists(id) on delete restrict,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null,
  description text not null,
  seo_title text check (seo_title is null or char_length(seo_title) <= 70),
  seo_description text check (seo_description is null or char_length(seo_description) <= 160),
  preview jsonb,
  specs jsonb not null default '[]'::jsonb,
  size text,
  category text,
  price_cents integer not null default 0 check (price_cents >= 0),
  currency char(3) not null default 'MYR',
  stock_count integer not null default 0 check (stock_count >= 0),
  order_message text,
  is_published boolean not null default true,
  archived_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists item_media (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references items(id) on delete cascade,
  storage_path text not null unique,
  media_type text not null check (media_type in ('image', 'video')),
  mime_type text not null check (
    (media_type = 'image' and mime_type in ('image/jpeg', 'image/png', 'image/webp', 'image/gif'))
    or (media_type = 'video' and mime_type = 'video/mp4')
  ),
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create sequence if not exists order_number_seq start with 1000;

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('ORD-' || lpad(nextval('order_number_seq')::text, 6, '0')),
  customer_name text not null,
  customer_email text,
  customer_phone text,
  shipping_address text,
  status order_status not null default 'draft',
  payment_status payment_status not null default 'unpaid',
  paid_at timestamptz,
  shipment_url text,
  notes text,
  stock_committed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (shipment_url is null or shipment_url ~ '^https?://')
);

create table if not exists order_lines (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  item_id uuid not null references items(id) on delete restrict,
  item_name text not null,
  artist_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0),
  created_at timestamptz not null default now()
);

create sequence if not exists invoice_number_seq start with 1000;
create sequence if not exists receipt_number_seq start with 1000;

create table if not exists order_documents (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete restrict,
  kind document_kind not null,
  document_number text not null unique,
  snapshot jsonb not null,
  generated_at timestamptz not null default now(),
  unique (order_id, kind)
);

create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  is_active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (email = lower(email))
);

create table if not exists admin_sessions (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references admin_users(id) on delete cascade,
  token_hash char(64) not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists artists_catalog_idx on artists (is_published, archived_at, sort_order, name);
create index if not exists items_catalog_idx on items (artist_id, is_published, archived_at, sort_order, name);
create index if not exists item_media_item_idx on item_media (item_id, sort_order);
create index if not exists artist_media_artist_idx on artist_media (artist_id, sort_order);
create index if not exists artist_links_artist_idx on artist_links (artist_id, sort_order);
create index if not exists orders_admin_idx on orders (created_at desc);
create index if not exists order_lines_order_idx on order_lines (order_id);
create index if not exists admin_sessions_active_idx on admin_sessions (token_hash, expires_at) where revoked_at is null;

-- The application connects through pg on the server. RLS deliberately exposes
-- no table rows through Supabase's autogenerated REST API or anonymous key.
alter table artists enable row level security;
alter table artist_links enable row level security;
alter table artist_media enable row level security;
alter table items enable row level security;
alter table item_media enable row level security;
alter table orders enable row level security;
alter table order_lines enable row level security;
alter table order_documents enable row level security;
alter table admin_users enable row level security;
alter table admin_sessions enable row level security;

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists artists_set_updated_at on artists;
create trigger artists_set_updated_at before update on artists for each row execute function set_updated_at();
drop trigger if exists items_set_updated_at on items;
create trigger items_set_updated_at before update on items for each row execute function set_updated_at();
drop trigger if exists orders_set_updated_at on orders;
create trigger orders_set_updated_at before update on orders for each row execute function set_updated_at();
drop trigger if exists admin_users_set_updated_at on admin_users;
create trigger admin_users_set_updated_at before update on admin_users for each row execute function set_updated_at();

-- Supabase Storage is intentionally the only Supabase-specific resource.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('catalog-images', 'catalog-images', true, 524288000, array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4']::text[])
on conflict (id) do update
set public = true,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
