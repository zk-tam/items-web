-- Editable search-result metadata for public artist and item pages.
alter table artists
  add column if not exists seo_title text,
  add column if not exists seo_description text;

alter table items
  add column if not exists seo_title text,
  add column if not exists seo_description text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'artists_seo_title_length_check') then
    alter table artists add constraint artists_seo_title_length_check check (seo_title is null or char_length(seo_title) <= 70);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'artists_seo_description_length_check') then
    alter table artists add constraint artists_seo_description_length_check check (seo_description is null or char_length(seo_description) <= 160);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'items_seo_title_length_check') then
    alter table items add constraint items_seo_title_length_check check (seo_title is null or char_length(seo_title) <= 70);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'items_seo_description_length_check') then
    alter table items add constraint items_seo_description_length_check check (seo_description is null or char_length(seo_description) <= 160);
  end if;
end $$;
