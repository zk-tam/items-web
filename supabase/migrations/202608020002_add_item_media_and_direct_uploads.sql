-- Upgrade ordered item images to ordered item media. Existing images remain
-- public catalog assets and retain their IDs, paths, alt text, and ordering.
do $$
begin
  if to_regclass('public.item_media') is null and to_regclass('public.item_images') is not null then
    alter table item_images rename to item_media;
  end if;
end $$;

create table if not exists item_media (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references items(id) on delete cascade,
  storage_path text not null unique,
  media_type text not null default 'image',
  mime_type text not null default 'image/jpeg',
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table item_media
  add column if not exists media_type text,
  add column if not exists mime_type text;

update item_media
set media_type = 'image',
    mime_type = case
      when lower(storage_path) like '%.png' then 'image/png'
      when lower(storage_path) like '%.webp' then 'image/webp'
      when lower(storage_path) like '%.gif' then 'image/gif'
      else 'image/jpeg'
    end
where media_type is null or mime_type is null;

alter table item_media
  alter column media_type set not null,
  alter column mime_type set not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'item_media_kind_check') then
    alter table item_media add constraint item_media_kind_check check (media_type in ('image', 'video'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'item_media_mime_type_check') then
    alter table item_media add constraint item_media_mime_type_check check (
      (media_type = 'image' and mime_type in ('image/jpeg', 'image/png', 'image/webp', 'image/gif'))
      or (media_type = 'video' and mime_type = 'video/mp4')
    );
  end if;
  if to_regclass('public.item_images_item_idx') is not null and to_regclass('public.item_media_item_idx') is null then
    alter index item_images_item_idx rename to item_media_item_idx;
  end if;
end $$;

create index if not exists item_media_item_idx on item_media (item_id, sort_order);
alter table item_media enable row level security;

-- Direct uploads are authorized by a server-created signed token. Bucket-level
-- limits also prevent unsupported media from being stored accidentally.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'catalog-images',
  'catalog-images',
  true,
  524288000,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4']::text[]
)
on conflict (id) do update
set public = true,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
