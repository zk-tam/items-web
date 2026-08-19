-- Older document snapshots predate the customer order-status fields. Preserve
-- their original financial data while filling these display-only invoice fields.
update order_documents document
set snapshot = jsonb_set(
  jsonb_set(
    jsonb_set(document.snapshot, '{orderStatus}', to_jsonb(order_row.status::text), true),
    '{paymentStatus}', to_jsonb(order_row.payment_status::text), true
  ),
  '{createdAt}', to_jsonb(order_row.created_at::text), true
)
from orders order_row
where document.order_id = order_row.id
  and (
    document.snapshot ->> 'orderStatus' is null
    or document.snapshot ->> 'paymentStatus' is null
    or document.snapshot ->> 'createdAt' is null
  );
