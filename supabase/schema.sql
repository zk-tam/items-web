create table if not exists artists (
  slug text primary key,
  name text not null,
  role text not null,
  bio text,
  image text,
  image_alt text,
  links jsonb not null default '[]'::jsonb,
  initially_expanded boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists products (
  slug text primary key,
  name text not null,
  artist_name text not null,
  artist_slug text not null references artists(slug) on update cascade,
  description text not null,
  preview jsonb,
  specs jsonb not null default '[]'::jsonb,
  size text not null,
  price_note text,
  images jsonb not null default '[]'::jsonb,
  order_message text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists products_artist_slug_idx on products (artist_slug);
create index if not exists products_sort_order_idx on products (sort_order);
create index if not exists artists_sort_order_idx on artists (sort_order);

alter table artists enable row level security;
alter table products enable row level security;

create policy "Public artists are readable"
  on artists for select
  using (true);

create policy "Public products are readable"
  on products for select
  using (true);
