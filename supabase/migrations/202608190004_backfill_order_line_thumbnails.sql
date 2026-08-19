-- Add cover references to historical lines where the source item still has an
-- image. New orders record this automatically at creation time.
update order_lines line
set thumbnail_path = (
  select media.storage_path
  from item_media media
  where media.item_id = line.item_id
    and media.media_type = 'image'
  order by media.sort_order asc
  limit 1
)
where line.thumbnail_path is null;

-- Existing invoice/receipt snapshots stay financially immutable while gaining
-- the same visual thumbnail reference as their corresponding order lines.
with refreshed_documents as (
  select document.id,
         jsonb_agg(
           case
             when line.thumbnail_path is null then snapshot_line.value
             else snapshot_line.value || jsonb_build_object('thumbnailPath', line.thumbnail_path)
           end
           order by snapshot_line.position
         ) as lines
  from order_documents document
  cross join lateral jsonb_array_elements(document.snapshot -> 'lines') with ordinality as snapshot_line(value, position)
  join lateral (
    select thumbnail_path
    from order_lines
    where order_id = document.order_id
    order by created_at
    offset (snapshot_line.position - 1)
    limit 1
  ) line on true
  group by document.id
)
update order_documents document
set snapshot = jsonb_set(document.snapshot, '{lines}', refreshed_documents.lines)
from refreshed_documents
where document.id = refreshed_documents.id;
