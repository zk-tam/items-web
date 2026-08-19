-- Preserve each order line's catalog cover reference for customer order views
-- and invoice generation. Existing historical lines remain valid without one.
alter table order_lines add column if not exists thumbnail_path text;
