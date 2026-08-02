import "server-only";

import type { PoolClient } from "pg";
import { queryRow, queryRows, withTransaction } from "@/lib/db/postgres";
import { inventoryTransition } from "@/lib/admin/order-state";
import { MAX_ITEM_MEDIA, type ItemMediaKind, type ItemMediaMimeType, type ItemMediaOrderEntry } from "@/lib/admin/item-media";

export type AdminArtist = {
  id: string;
  slug: string;
  name: string;
  role: string | null;
  description: string | null;
  email: string | null;
  websiteUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  profileImagePath: string | null;
  profileImageAlt: string | null;
  initiallyExpanded: boolean;
  isPublished: boolean;
  archivedAt: Date | null;
  sortOrder: number;
  itemCount?: number;
  links: Array<{ label: string; url: string; sortOrder: number }>;
  media: Array<{ id: string; storagePath: string; altText: string | null; mediaType: ItemMediaKind; mimeType: ItemMediaMimeType; sortOrder: number }>;
};

export type AdminItem = {
  id: string;
  artistId: string;
  artistName: string;
  slug: string;
  name: string;
  description: string;
  preview: string[] | null;
  specs: string[];
  size: string | null;
  category: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  priceCents: number;
  currency: string;
  stockCount: number;
  orderMessage: string | null;
  isPublished: boolean;
  archivedAt: Date | null;
  sortOrder: number;
  media: Array<{ id: string; storagePath: string; altText: string | null; mediaType: ItemMediaKind; mimeType: ItemMediaMimeType; sortOrder: number }>;
};

export type OrderStatus = "draft" | "awaiting_payment" | "processing" | "shipped" | "completed" | "cancelled";
export type PaymentStatus = "unpaid" | "paid" | "refunded";

export type AdminOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  shippingAddress: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paidAt: Date | null;
  shipmentUrl: string | null;
  notes: string | null;
  stockCommitted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type OrderLine = {
  id: string;
  itemId: string;
  itemName: string;
  artistName: string;
  quantity: number;
  unitPriceCents: number;
};

export type OrderDocument = {
  id: string;
  kind: "invoice" | "receipt";
  documentNumber: string;
  snapshot: DocumentSnapshot;
  generatedAt: Date;
};

export type DocumentSnapshot = {
  kind: "invoice" | "receipt";
  documentNumber: string;
  generatedAt: string;
  seller: { name: string; address?: string; email?: string; phone?: string; taxId?: string };
  customer: { name: string; email?: string; phone?: string; shippingAddress?: string };
  orderNumber: string;
  currency: string;
  lines: Array<{ itemName: string; artistName: string; quantity: number; unitPriceCents: number }>;
  totalCents: number;
};

export type ArtistInput = Omit<AdminArtist, "id" | "archivedAt" | "itemCount" | "links" | "media"> & {
  links: Array<{ label: string; url: string }>;
};

export type ItemInput = Omit<AdminItem, "id" | "artistName" | "archivedAt" | "media">;

export async function listAdminArtists() {
  return (await queryRows<AdminArtist>(
    `select artist.id, artist.slug, artist.name, artist.role, artist.description, artist.email,
            artist.website_url as "websiteUrl", artist.seo_title as "seoTitle", artist.seo_description as "seoDescription", artist.profile_image_path as "profileImagePath",
            artist.profile_image_alt as "profileImageAlt", artist.initially_expanded as "initiallyExpanded",
            artist.is_published as "isPublished", artist.archived_at as "archivedAt", artist.sort_order as "sortOrder",
            count(item.id)::int as "itemCount", '[]'::jsonb as links, '[]'::jsonb as media
     from artists artist
     left join items item on item.artist_id = artist.id and item.archived_at is null
     group by artist.id
     order by artist.archived_at nulls first, artist.sort_order asc, artist.name asc`
  )) ?? [];
}

export async function getAdminArtist(id: string) {
  const artist = await queryRow<AdminArtist>(
    `select id, slug, name, role, description, email, website_url as "websiteUrl", seo_title as "seoTitle", seo_description as "seoDescription",
            profile_image_path as "profileImagePath", profile_image_alt as "profileImageAlt",
            initially_expanded as "initiallyExpanded", is_published as "isPublished", archived_at as "archivedAt", sort_order as "sortOrder",
            '[]'::jsonb as links, '[]'::jsonb as media
     from artists where id = $1`,
    [id]
  );
  if (!artist) return null;
  const links = (await queryRows<{ label: string; url: string; sortOrder: number }>(
    `select label, url, sort_order as "sortOrder" from artist_links where artist_id = $1 order by sort_order, label`,
    [id]
  )) ?? [];
  const media = (await queryRows<{ id: string; storagePath: string; altText: string | null; mediaType: ItemMediaKind; mimeType: ItemMediaMimeType; sortOrder: number }>(
    `select id, storage_path as "storagePath", alt_text as "altText", media_type as "mediaType", mime_type as "mimeType", sort_order as "sortOrder" from artist_media where artist_id = $1 order by sort_order`,
    [id]
  )) ?? [];
  return { ...artist, links, media };
}

export async function saveArtist(input: ArtistInput, id?: string) {
  return withTransaction(async (client) => {
    const artist = id
      ? await client.query<{ id: string }>(
          `update artists set slug = $2, name = $3, role = $4, description = $5, email = $6, website_url = $7,
             profile_image_path = $8, profile_image_alt = $9, initially_expanded = $10, is_published = $11, sort_order = $12, seo_title = $13, seo_description = $14
           where id = $1 returning id`,
          [id, input.slug, input.name, input.role, input.description, input.email, input.websiteUrl, input.profileImagePath, input.profileImageAlt, input.initiallyExpanded, input.isPublished, input.sortOrder, input.seoTitle, input.seoDescription]
        )
      : await client.query<{ id: string }>(
          `insert into artists (slug, name, role, description, email, website_url, profile_image_path, profile_image_alt, initially_expanded, is_published, sort_order, seo_title, seo_description)
           values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) returning id`,
          [input.slug, input.name, input.role, input.description, input.email, input.websiteUrl, input.profileImagePath, input.profileImageAlt, input.initiallyExpanded, input.isPublished, input.sortOrder, input.seoTitle, input.seoDescription]
        );

    const artistId = artist.rows[0]?.id;
    if (!artistId) throw new Error("Artist could not be saved.");
    await client.query(`delete from artist_links where artist_id = $1`, [artistId]);
    for (const [sortOrder, link] of input.links.entries()) {
      await client.query(`insert into artist_links (artist_id, label, url, sort_order) values ($1, $2, $3, $4)`, [artistId, link.label, link.url, sortOrder]);
    }
    return artistId;
  });
}

export async function archiveArtist(id: string) {
  await queryRow(`update artists set archived_at = now(), is_published = false where id = $1 returning id`, [id]);
}

export async function listAdminItems() {
  return (await queryRows<AdminItem>(
    `select item.id, item.artist_id as "artistId", artist.name as "artistName", item.slug, item.name, item.description, item.preview, item.specs,
            item.size, item.category, item.seo_title as "seoTitle", item.seo_description as "seoDescription", item.price_cents as "priceCents", item.currency, item.stock_count as "stockCount", item.order_message as "orderMessage",
            item.is_published as "isPublished", item.archived_at as "archivedAt", item.sort_order as "sortOrder", '[]'::jsonb as media
     from items item join artists artist on artist.id = item.artist_id
     order by item.archived_at nulls first, item.sort_order asc, item.name asc`
  )) ?? [];
}

export async function listItemOptions() {
  return (await queryRows<{ id: string; name: string; artistName: string; priceCents: number; stockCount: number }>(
    `select item.id, item.name, artist.name as "artistName", item.price_cents as "priceCents", item.stock_count as "stockCount"
     from items item join artists artist on artist.id = item.artist_id
     where item.archived_at is null
     order by item.name asc`
  )) ?? [];
}

export async function getAdminItem(id: string) {
  const item = await queryRow<AdminItem>(
    `select item.id, item.artist_id as "artistId", artist.name as "artistName", item.slug, item.name, item.description, item.preview, item.specs,
            item.size, item.category, item.seo_title as "seoTitle", item.seo_description as "seoDescription", item.price_cents as "priceCents", item.currency, item.stock_count as "stockCount", item.order_message as "orderMessage",
            item.is_published as "isPublished", item.archived_at as "archivedAt", item.sort_order as "sortOrder", '[]'::jsonb as media
     from items item join artists artist on artist.id = item.artist_id where item.id = $1`,
    [id]
  );
  if (!item) return null;
  const media = (await queryRows<{ id: string; storagePath: string; altText: string | null; mediaType: ItemMediaKind; mimeType: ItemMediaMimeType; sortOrder: number }>(
    `select id, storage_path as "storagePath", alt_text as "altText", media_type as "mediaType", mime_type as "mimeType", sort_order as "sortOrder" from item_media where item_id = $1 order by sort_order`,
    [id]
  )) ?? [];
  return { ...item, media };
}

export async function saveItem(input: ItemInput, id?: string) {
  const query = id
    ? {
        text: `update items set artist_id = $2, slug = $3, name = $4, description = $5, preview = $6, specs = $7, size = $8, category = $9,
              price_cents = $10, currency = $11, stock_count = $12, order_message = $13, is_published = $14, sort_order = $15, seo_title = $16, seo_description = $17
              where id = $1 returning id`,
        values: [id, input.artistId, input.slug, input.name, input.description, JSON.stringify(input.preview), JSON.stringify(input.specs), input.size, input.category, input.priceCents, input.currency, input.stockCount, input.orderMessage, input.isPublished, input.sortOrder, input.seoTitle, input.seoDescription]
      }
    : {
        text: `insert into items (artist_id, slug, name, description, preview, specs, size, category, price_cents, currency, stock_count, order_message, is_published, sort_order, seo_title, seo_description)
              values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) returning id`,
        values: [input.artistId, input.slug, input.name, input.description, JSON.stringify(input.preview), JSON.stringify(input.specs), input.size, input.category, input.priceCents, input.currency, input.stockCount, input.orderMessage, input.isPublished, input.sortOrder, input.seoTitle, input.seoDescription]
      };
  const result = await queryRow<{ id: string }>(query.text, query.values);
  if (!result) throw new Error("Item could not be saved.");
  return result.id;
}

export async function synchronizeItemMedia(itemId: string, order: ItemMediaOrderEntry[]) {
  if (order.length > MAX_ITEM_MEDIA) {
    throw new Error(`An item can have at most ${MAX_ITEM_MEDIA} media files.`);
  }

  return withTransaction(async (client) => {
    const existing = await client.query<{ id: string; storagePath: string }>(
      `select id, storage_path as "storagePath" from item_media where item_id = $1 order by sort_order for update`,
      [itemId]
    );
    const existingById = new Map(existing.rows.map((image) => [image.id, image]));
    const orderedExisting = order.filter((entry): entry is Extract<ItemMediaOrderEntry, { kind: "existing" }> => entry.kind === "existing");

    if (orderedExisting.some((entry) => !existingById.has(entry.id))) {
      throw new Error("One or more existing media files do not belong to this item.");
    }

    const keptIds = new Set(orderedExisting.map((entry) => entry.id));
    const removedPaths = existing.rows.filter((image) => !keptIds.has(image.id)).map((image) => image.storagePath);
    if (removedPaths.length > 0) {
      await client.query(`delete from item_media where item_id = $1 and id <> all($2::uuid[])`, [itemId, [...keptIds]]);
    }

    for (const [sortOrder, entry] of order.entries()) {
      if (entry.kind === "existing") {
        await client.query(
          `update item_media set sort_order = $3, alt_text = $4 where id = $1 and item_id = $2`,
          [entry.id, itemId, sortOrder, entry.altText]
        );
        continue;
      }

      await client.query(
        `insert into item_media (item_id, storage_path, media_type, mime_type, alt_text, sort_order) values ($1, $2, $3, $4, $5, $6)`,
        [itemId, entry.storagePath, entry.mediaType, entry.mimeType, entry.altText, sortOrder]
      );
    }

    return removedPaths;
  });
}

export async function listAttachedItemMediaPaths(paths: string[]) {
  if (paths.length === 0) return [];
  return ((await queryRows<{ storagePath: string }>(
    `select storage_path as "storagePath" from item_media where storage_path = any($1::text[])`,
    [paths]
  )) ?? []).map((row) => row.storagePath);
}

export async function synchronizeArtistMedia(artistId: string, order: ItemMediaOrderEntry[]) {
  if (order.length > MAX_ITEM_MEDIA) {
    throw new Error(`An artist can have at most ${MAX_ITEM_MEDIA} media files.`);
  }

  return withTransaction(async (client) => {
    const existing = await client.query<{ id: string; storagePath: string }>(
      `select id, storage_path as "storagePath" from artist_media where artist_id = $1 order by sort_order for update`,
      [artistId]
    );
    const existingById = new Map(existing.rows.map((media) => [media.id, media]));
    const orderedExisting = order.filter((entry): entry is Extract<ItemMediaOrderEntry, { kind: "existing" }> => entry.kind === "existing");

    if (orderedExisting.some((entry) => !existingById.has(entry.id))) {
      throw new Error("One or more existing media files do not belong to this artist.");
    }

    const keptIds = new Set(orderedExisting.map((entry) => entry.id));
    const removedPaths = existing.rows.filter((media) => !keptIds.has(media.id)).map((media) => media.storagePath);
    if (removedPaths.length > 0) {
      await client.query(`delete from artist_media where artist_id = $1 and id <> all($2::uuid[])`, [artistId, [...keptIds]]);
    }

    for (const [sortOrder, entry] of order.entries()) {
      if (entry.kind === "existing") {
        await client.query(
          `update artist_media set sort_order = $3, alt_text = $4 where id = $1 and artist_id = $2`,
          [entry.id, artistId, sortOrder, entry.altText]
        );
        continue;
      }

      await client.query(
        `insert into artist_media (artist_id, storage_path, media_type, mime_type, alt_text, sort_order) values ($1, $2, $3, $4, $5, $6)`,
        [artistId, entry.storagePath, entry.mediaType, entry.mimeType, entry.altText, sortOrder]
      );
    }

    return removedPaths;
  });
}

export async function listAttachedArtistMediaPaths(paths: string[]) {
  if (paths.length === 0) return [];
  return ((await queryRows<{ storagePath: string }>(
    `select storage_path as "storagePath" from artist_media where storage_path = any($1::text[])`,
    [paths]
  )) ?? []).map((row) => row.storagePath);
}

export async function archiveItem(id: string) {
  await queryRow(`update items set archived_at = now(), is_published = false where id = $1 returning id`, [id]);
}

export async function listAdminOrders() {
  return (await queryRows<AdminOrder>(
    `select id, order_number as "orderNumber", customer_name as "customerName", customer_email as "customerEmail", customer_phone as "customerPhone",
            shipping_address as "shippingAddress", status, payment_status as "paymentStatus", paid_at as "paidAt", shipment_url as "shipmentUrl", notes,
            stock_committed as "stockCommitted", created_at as "createdAt", updated_at as "updatedAt"
     from orders order_row order by order_row.created_at desc`
  )) ?? [];
}

export async function getAdminOrder(id: string) {
  const order = await queryRow<AdminOrder>(
    `select id, order_number as "orderNumber", customer_name as "customerName", customer_email as "customerEmail", customer_phone as "customerPhone",
            shipping_address as "shippingAddress", status, payment_status as "paymentStatus", paid_at as "paidAt", shipment_url as "shipmentUrl", notes,
            stock_committed as "stockCommitted", created_at as "createdAt", updated_at as "updatedAt"
     from orders where id = $1`, [id]
  );
  if (!order) return null;
  const lines = (await queryRows<OrderLine>(
    `select id, item_id as "itemId", item_name as "itemName", artist_name as "artistName", quantity, unit_price_cents as "unitPriceCents"
     from order_lines where order_id = $1 order by created_at`, [id]
  )) ?? [];
  const documents = (await queryRows<OrderDocument>(
    `select id, kind, document_number as "documentNumber", snapshot, generated_at as "generatedAt"
     from order_documents where order_id = $1 order by generated_at`, [id]
  )) ?? [];
  return { order, lines, documents };
}

export async function createOrder(input: { customerName: string; customerEmail: string | null; customerPhone: string | null; shippingAddress: string | null; notes: string | null; lines: Array<{ itemId: string; quantity: number }> }) {
  if (input.lines.length === 0) throw new Error("An order needs at least one item.");
  return withTransaction(async (client) => {
    const quantities = new Map<string, number>();
    for (const line of input.lines) quantities.set(line.itemId, (quantities.get(line.itemId) ?? 0) + line.quantity);
    const itemIds = [...quantities.keys()];
    const items = await client.query<{ id: string; name: string; artistName: string; priceCents: number }>(
      `select item.id, item.name, artist.name as "artistName", item.price_cents as "priceCents"
       from items item join artists artist on artist.id = item.artist_id
       where item.id = any($1::uuid[]) and item.archived_at is null
       for update of item`,
      [itemIds]
    );
    if (items.rows.length !== itemIds.length) throw new Error("One or more selected items are unavailable.");
    const orderResult = await client.query<{ id: string }>(
      `insert into orders (customer_name, customer_email, customer_phone, shipping_address, notes, status)
       values ($1, $2, $3, $4, $5, 'awaiting_payment') returning id`,
      [input.customerName, input.customerEmail, input.customerPhone, input.shippingAddress, input.notes]
    );
    const orderId = orderResult.rows[0]?.id;
    if (!orderId) throw new Error("Order could not be created.");
    for (const item of items.rows) {
      await client.query(
        `insert into order_lines (order_id, item_id, item_name, artist_name, quantity, unit_price_cents)
         values ($1, $2, $3, $4, $5, $6)`,
        [orderId, item.id, item.name, item.artistName, quantities.get(item.id), item.priceCents]
      );
    }
    return orderId;
  });
}

async function adjustStockForOrder(client: PoolClient, orderId: string, direction: "decrement" | "increment") {
  const lines = await client.query<{ itemId: string; quantity: number }>(
    `select item_id as "itemId", sum(quantity)::int as quantity from order_lines where order_id = $1 group by item_id`, [orderId]
  );
  const ids = lines.rows.map((line) => line.itemId);
  const items = await client.query<{ id: string; stockCount: number }>(
    `select id, stock_count as "stockCount" from items where id = any($1::uuid[]) for update`, [ids]
  );
  if (items.rows.length !== ids.length) throw new Error("An ordered item no longer exists.");
  const stockById = new Map(items.rows.map((item) => [item.id, item.stockCount]));
  if (direction === "decrement") {
    for (const line of lines.rows) {
      if ((stockById.get(line.itemId) ?? 0) < line.quantity) throw new Error("Insufficient stock to mark this order as paid.");
    }
  }
  for (const line of lines.rows) {
    await client.query(`update items set stock_count = stock_count ${direction === "decrement" ? "-" : "+"} $2 where id = $1`, [line.itemId, line.quantity]);
  }
}

export async function updateOrder(id: string, input: { customerName: string; customerEmail: string | null; customerPhone: string | null; shippingAddress: string | null; status: OrderStatus; paymentStatus: PaymentStatus; shipmentUrl: string | null; notes: string | null }) {
  return withTransaction(async (client) => {
    const result = await client.query<AdminOrder>(
      `select id, order_number as "orderNumber", customer_name as "customerName", customer_email as "customerEmail", customer_phone as "customerPhone",
              shipping_address as "shippingAddress", status, payment_status as "paymentStatus", paid_at as "paidAt", shipment_url as "shipmentUrl", notes,
              stock_committed as "stockCommitted", created_at as "createdAt", updated_at as "updatedAt"
       from orders where id = $1 for update`, [id]
    );
    const order = result.rows[0];
    if (!order) throw new Error("Order was not found.");
    if (input.status === "shipped" && !input.shipmentUrl) throw new Error("A shipment URL is required before marking an order as shipped.");

    const { shouldRestore, shouldCommit } = inventoryTransition(order.stockCommitted, input.status, input.paymentStatus);
    if (shouldRestore) await adjustStockForOrder(client, id, "increment");
    if (shouldCommit) await adjustStockForOrder(client, id, "decrement");

    await client.query(
      `update orders set customer_name = $2, customer_email = $3, customer_phone = $4, shipping_address = $5,
       status = $6, payment_status = $7, shipment_url = $8, notes = $9,
       paid_at = case when $7 = 'paid'::payment_status then coalesce(paid_at, now()) else paid_at end,
       stock_committed = case when $10 then false when $11 then true else stock_committed end
       where id = $1`,
      [id, input.customerName, input.customerEmail, input.customerPhone, input.shippingAddress, input.status, input.paymentStatus, input.shipmentUrl, input.notes, shouldRestore, shouldCommit]
    );
  });
}

export async function deleteDraftOrder(id: string) {
  const deleted = await queryRow<{ id: string }>(
    `delete from orders order_row
     where order_row.id = $1 and order_row.status = 'draft' and not exists (select 1 from order_documents document where document.order_id = order_row.id)
     returning order_row.id`, [id]
  );
  if (!deleted) throw new Error("Only draft orders without documents can be deleted.");
}

function sellerDetails() {
  return {
    name: process.env.BUSINESS_NAME ?? "ITEMS",
    address: process.env.BUSINESS_ADDRESS || undefined,
    email: process.env.BUSINESS_EMAIL || undefined,
    phone: process.env.BUSINESS_PHONE || undefined,
    taxId: process.env.BUSINESS_TAX_ID || undefined
  };
}

export async function getOrCreateOrderDocument(orderId: string, kind: "invoice" | "receipt") {
  return withTransaction(async (client) => {
    const existing = await client.query<OrderDocument>(
      `select id, kind, document_number as "documentNumber", snapshot, generated_at as "generatedAt"
       from order_documents where order_id = $1 and kind = $2 for update`, [orderId, kind]
    );
    if (existing.rows[0]) return existing.rows[0];

    const orderResult = await client.query<AdminOrder>(
      `select id, order_number as "orderNumber", customer_name as "customerName", customer_email as "customerEmail", customer_phone as "customerPhone",
              shipping_address as "shippingAddress", status, payment_status as "paymentStatus", paid_at as "paidAt", shipment_url as "shipmentUrl", notes,
              stock_committed as "stockCommitted", created_at as "createdAt", updated_at as "updatedAt"
       from orders where id = $1 for update`, [orderId]
    );
    const order = orderResult.rows[0];
    if (!order || order.status === "cancelled") throw new Error("Documents cannot be generated for this order.");
    if (kind === "receipt" && order.paymentStatus !== "paid") throw new Error("A receipt can only be generated after payment.");
    const lines = await client.query<OrderLine>(
      `select id, item_id as "itemId", item_name as "itemName", artist_name as "artistName", quantity, unit_price_cents as "unitPriceCents"
       from order_lines where order_id = $1 order by created_at`, [orderId]
    );
    const sequence = await client.query<{ value: string }>(`select nextval($1::regclass)::text as value`, [kind === "invoice" ? "invoice_number_seq" : "receipt_number_seq"]);
    const documentNumber = `${kind === "invoice" ? "INV" : "RCT"}-${String(sequence.rows[0]?.value ?? "0").padStart(6, "0")}`;
    const snapshot: DocumentSnapshot = {
      kind,
      documentNumber,
      generatedAt: new Date().toISOString(),
      seller: sellerDetails(),
      customer: {
        name: order.customerName,
        email: order.customerEmail ?? undefined,
        phone: order.customerPhone ?? undefined,
        shippingAddress: order.shippingAddress ?? undefined
      },
      orderNumber: order.orderNumber,
      currency: "MYR",
      lines: lines.rows.map((line) => ({ itemName: line.itemName, artistName: line.artistName, quantity: line.quantity, unitPriceCents: line.unitPriceCents })),
      totalCents: lines.rows.reduce((total, line) => total + line.quantity * line.unitPriceCents, 0)
    };
    const inserted = await client.query<OrderDocument>(
      `insert into order_documents (order_id, kind, document_number, snapshot)
       values ($1, $2, $3, $4::jsonb)
       on conflict (order_id, kind) do nothing
       returning id, kind, document_number as "documentNumber", snapshot, generated_at as "generatedAt"`,
      [orderId, kind, documentNumber, JSON.stringify(snapshot)]
    );
    if (inserted.rows[0]) return inserted.rows[0];
    const racedDocument = await client.query<OrderDocument>(
      `select id, kind, document_number as "documentNumber", snapshot, generated_at as "generatedAt"
       from order_documents where order_id = $1 and kind = $2`,
      [orderId, kind]
    );
    return racedDocument.rows[0] as OrderDocument;
  });
}
