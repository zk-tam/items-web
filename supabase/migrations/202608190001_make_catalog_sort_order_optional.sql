-- Explicit display positions are optional. Unpositioned records are ordered by
-- creation date in the application queries instead of being treated as zero.
alter table artists alter column sort_order drop default;
alter table artists alter column sort_order drop not null;
update artists set sort_order = null where sort_order = 0;

alter table items alter column sort_order drop default;
alter table items alter column sort_order drop not null;
update items set sort_order = null where sort_order = 0;

drop index if exists artists_catalog_idx;
create index artists_catalog_idx on artists (is_published, archived_at, sort_order asc nulls last, created_at desc, name);

drop index if exists items_catalog_idx;
create index items_catalog_idx on items (artist_id, is_published, archived_at, sort_order asc nulls last, created_at desc, name);
