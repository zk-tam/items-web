#!/usr/bin/env node
import { randomUUID } from "node:crypto";
import nextEnv from "@next/env";
import pg from "pg";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required for the integration smoke test.");
}

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSLMODE === "require" || process.env.DATABASE_URL.includes("supabase.co")
    ? { rejectUnauthorized: false }
    : undefined
});
const token = randomUUID().replaceAll("-", "");
const artistSlug = `audit-artist-${token.slice(0, 10)}`;
const itemSlug = `audit-item-${token.slice(10, 20)}`;

await client.connect();
try {
  const rls = await client.query(
    `select relname, relrowsecurity
     from pg_class
     join pg_namespace on pg_namespace.oid = pg_class.relnamespace
     where nspname = 'public'
       and relname = any($1::text[])`,
    [["artists", "artist_links", "artist_media", "items", "item_media", "orders", "order_lines", "order_documents", "admin_users", "admin_sessions"]]
  );
  if (rls.rows.length !== 10 || rls.rows.some((row) => !row.relrowsecurity)) {
    throw new Error("Expected RLS to be enabled on every ITEMS application table.");
  }

  await client.query("begin");
  try {
    const artist = await client.query(
      `insert into artists (slug, name, role, description, seo_title, seo_description)
       values ($1, 'Audit Artist', 'Test', 'Rollback-only smoke test', 'Audit Artist | ITEMS', 'Rollback-only SEO metadata test.') returning id`,
      [artistSlug]
    );
    const artistId = artist.rows[0].id;
    const artistImagePath = `audit/${token}-artist.jpg`;
    const artistVideoPath = `audit/${token}-artist.mp4`;
    await client.query(
      `insert into artist_media (artist_id, storage_path, media_type, mime_type, alt_text, sort_order)
       values ($1, $2, 'image', 'image/jpeg', 'Artist portrait detail', 1), ($1, $3, 'video', 'video/mp4', 'Artist video', 0)`,
      [artistId, artistImagePath, artistVideoPath]
    );
    const orderedArtistMedia = await client.query(
      `select storage_path, media_type, mime_type, alt_text, sort_order from artist_media where artist_id = $1 order by sort_order`,
      [artistId]
    );
    if (orderedArtistMedia.rows.length !== 2 || orderedArtistMedia.rows[0]?.storage_path !== artistVideoPath || orderedArtistMedia.rows[1]?.alt_text !== "Artist portrait detail") {
      throw new Error("Artist media order, type, or alt text did not persist correctly.");
    }
    const item = await client.query(
      `insert into items (artist_id, slug, name, description, seo_title, seo_description, price_cents, stock_count)
       values ($1, $2, 'Audit Item', 'Rollback-only smoke test', 'Audit Item | ITEMS', 'Rollback-only SEO metadata test.', 1250, 3) returning id`,
      [artistId, itemSlug]
    );
    const itemId = item.rows[0].id;
    const firstImagePath = `audit/${token}-first.jpg`;
    const secondImagePath = `audit/${token}-second.jpg`;
    const videoPath = `audit/${token}-video.mp4`;
    await client.query(
      `insert into item_media (item_id, storage_path, media_type, mime_type, alt_text, sort_order)
       values ($1, $2, 'image', 'image/jpeg', 'First image', 1), ($1, $3, 'image', 'image/jpeg', 'Second image', 0), ($1, $4, 'video', 'video/mp4', 'Item video', 2)`,
      [itemId, firstImagePath, secondImagePath, videoPath]
    );
    const orderedImages = await client.query(
      `select storage_path, media_type, mime_type, alt_text, sort_order from item_media where item_id = $1 order by sort_order`,
      [itemId]
    );
    if (orderedImages.rows.length !== 3 || orderedImages.rows[0]?.storage_path !== secondImagePath || orderedImages.rows[1]?.alt_text !== "First image" || orderedImages.rows[2]?.media_type !== "video" || orderedImages.rows[2]?.mime_type !== "video/mp4") {
      throw new Error("Item media order, type, or alt text did not persist correctly.");
    }
    const order = await client.query(
      `insert into orders (order_number, customer_name, status, payment_status)
       values ($1, 'Audit Customer', 'awaiting_payment', 'unpaid') returning id`,
      [`AUDIT-${token.slice(20, 30)}`]
    );
    await client.query(
      `insert into order_lines (order_id, item_id, item_name, artist_name, quantity, unit_price_cents)
       values ($1, $2, 'Audit Item', 'Audit Artist', 2, 1250)`,
      [order.rows[0].id, itemId]
    );

    await client.query("savepoint invalid_stock");
    let rejectedInvalidStock = false;
    try {
      await client.query(
        `insert into items (artist_id, slug, name, description, stock_count)
         values ($1, $2, 'Invalid', 'Must fail', -1)`,
        [artistId, `invalid-${token.slice(0, 12)}`]
      );
    } catch {
      rejectedInvalidStock = true;
    }
    await client.query("rollback to savepoint invalid_stock");
    if (!rejectedInvalidStock) {
      throw new Error("Negative stock was accepted unexpectedly.");
    }

    await client.query("savepoint invalid_seo_metadata");
    let rejectedOversizedSeoTitle = false;
    try {
      await client.query(`update artists set seo_title = $2 where id = $1`, [artistId, "x".repeat(71)]);
    } catch {
      rejectedOversizedSeoTitle = true;
    }
    await client.query("rollback to savepoint invalid_seo_metadata");
    if (!rejectedOversizedSeoTitle) {
      throw new Error("An SEO title longer than 70 characters was accepted unexpectedly.");
    }

    const seo = await client.query(
      `select artist.seo_title as "artistSeoTitle", item.seo_description as "itemSeoDescription"
       from artists artist join items item on item.artist_id = artist.id
       where artist.id = $1 and item.id = $2`,
      [artistId, itemId]
    );
    if (seo.rows[0]?.artistSeoTitle !== "Audit Artist | ITEMS" || seo.rows[0]?.itemSeoDescription !== "Rollback-only SEO metadata test.") {
      throw new Error("SEO metadata did not persist correctly.");
    }

    const totals = await client.query(
      `select count(*)::int as line_count, sum(quantity * unit_price_cents)::int as total_cents
       from order_lines where order_id = $1`,
      [order.rows[0].id]
    );
    if (totals.rows[0].line_count !== 1 || totals.rows[0].total_cents !== 2500) {
      throw new Error("Order-line snapshots or totals did not persist correctly.");
    }
  } finally {
    await client.query("rollback");
  }

  const bucket = await client.query(`select public from storage.buckets where id = 'catalog-images'`);
  if (bucket.rows[0]?.public !== true) {
    throw new Error("catalog-images is missing or is not public.");
  }

  console.log("Integration smoke test passed: schema, RLS, SEO metadata, artist/item media ordering, media types, constraints, order snapshots, and image bucket.");
} finally {
  await client.end();
}
