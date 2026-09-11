-- An item can be credited to one or more artists. The ordered relationship is
-- the source of truth; items.artist_id remains the first artist for legacy
-- integrations and is kept in sync by the application.
create table if not exists item_artists (
  item_id uuid not null references items(id) on delete cascade,
  artist_id uuid not null references artists(id) on delete restrict,
  sort_order integer not null check (sort_order >= 0),
  created_at timestamptz not null default now(),
  primary key (item_id, artist_id),
  unique (item_id, sort_order)
);

-- Every existing item retains its current artist as the first credit.
insert into item_artists (item_id, artist_id, sort_order)
select id, artist_id, 0
from items
on conflict (item_id, artist_id) do nothing;

create index if not exists item_artists_artist_item_idx on item_artists (artist_id, item_id);
alter table item_artists enable row level security;
