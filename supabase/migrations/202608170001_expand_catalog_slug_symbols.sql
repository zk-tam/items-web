alter table artists
  drop constraint if exists artists_slug_check,
  add constraint artists_slug_check
    check (slug ~ '^[@_]*[a-z0-9][a-z0-9@_]*(-[@_]*[a-z0-9][a-z0-9@_]*)*$');

alter table items
  drop constraint if exists items_slug_check,
  add constraint items_slug_check
    check (slug ~ '^[@_]*[a-z0-9][a-z0-9@_]*(-[@_]*[a-z0-9][a-z0-9@_]*)*$');
