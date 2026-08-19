-- A high-entropy, unguessable token provides the customer-facing order URL.
-- Existing orders receive a token immediately so every order can be shared.
alter table orders add column if not exists public_token uuid;
update orders set public_token = gen_random_uuid() where public_token is null;
alter table orders alter column public_token set default gen_random_uuid();
alter table orders alter column public_token set not null;

create unique index if not exists orders_public_token_idx on orders (public_token);
