-- Concise catalog copy displayed when an item card is expanded.
alter table items
  add column if not exists short_description text;
