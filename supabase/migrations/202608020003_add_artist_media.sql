-- Artists keep their existing profile image as the page hero/portrait and gain
-- a separate ordered gallery for additional images, GIFs, and MP4 videos.
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

create index if not exists artist_media_artist_idx on artist_media (artist_id, sort_order);
alter table artist_media enable row level security;
