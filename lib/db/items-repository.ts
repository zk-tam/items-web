import type { CatalogArtist as Artist, CatalogItem as Product } from "@/lib/catalog/types";
import { queryRows } from "@/lib/db/postgres";
import { getStoragePublicUrl } from "@/lib/storage/supabase-storage";

type ArtistRow = {
  id: string;
  slug: string;
  name: string;
  role: string | null;
  description: string | null;
  email: string | null;
  websiteUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  imagePath: string | null;
  imageAlt: string | null;
  initiallyExpanded: boolean;
  isPublished: boolean;
  archivedAt: Date | null;
  sortOrder: number;
  links: Array<{ id: string; label: string; href: string; sortOrder: number }> | null;
};

type ItemRow = {
  id: string;
  slug: string;
  name: string;
  artistId: string;
  artistName: string;
  artistSlug: string;
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
  images: Array<{ id: string; storagePath: string; alt: string | null; sortOrder: number }> | null;
};

const artistSelect = `
  select
    artist.id,
    artist.slug,
    artist.name,
    artist.role,
    artist.description,
    artist.email,
    artist.website_url as "websiteUrl",
    artist.seo_title as "seoTitle",
    artist.seo_description as "seoDescription",
    artist.profile_image_path as "imagePath",
    artist.profile_image_alt as "imageAlt",
    artist.initially_expanded as "initiallyExpanded",
    artist.is_published as "isPublished",
    artist.archived_at as "archivedAt",
    artist.sort_order as "sortOrder",
    coalesce(
      jsonb_agg(
        jsonb_build_object('id', link.id, 'label', link.label, 'href', link.url, 'sortOrder', link.sort_order)
        order by link.sort_order asc, link.label asc
      ) filter (where link.id is not null),
      '[]'::jsonb
    ) as links
  from artists artist
  left join artist_links link on link.artist_id = artist.id
`;

const itemSelect = `
  select
    item.id,
    item.slug,
    item.name,
    item.artist_id as "artistId",
    artist.name as "artistName",
    artist.slug as "artistSlug",
    item.description,
    item.preview,
    item.specs,
    item.size,
    item.category,
    item.seo_title as "seoTitle",
    item.seo_description as "seoDescription",
    item.price_cents as "priceCents",
    item.currency,
    item.stock_count as "stockCount",
    item.order_message as "orderMessage",
    item.is_published as "isPublished",
    item.archived_at as "archivedAt",
    item.sort_order as "sortOrder",
    coalesce(
      jsonb_agg(
        jsonb_build_object('id', image.id, 'storagePath', image.storage_path, 'alt', image.alt_text, 'sortOrder', image.sort_order)
        order by image.sort_order asc
      ) filter (where image.id is not null),
      '[]'::jsonb
    ) as images
  from items item
  join artists artist on artist.id = item.artist_id
  left join item_images image on image.item_id = item.id
`;

function mapArtist(row: ArtistRow): Artist {
  const links = [...(row.links ?? [])];
  if (row.websiteUrl && !links.some((link) => link.href === row.websiteUrl)) {
    links.unshift({ id: `website-${row.id}`, label: "Website", href: row.websiteUrl, sortOrder: -2 });
  }
  if (row.email && !links.some((link) => link.href === `mailto:${row.email}`)) {
    links.push({ id: `email-${row.id}`, label: "Email", href: `mailto:${row.email}`, sortOrder: links.length });
  }
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    role: row.role ?? "Artist",
    bio: row.description ?? undefined,
    email: row.email ?? undefined,
    websiteUrl: row.websiteUrl ?? undefined,
    seoTitle: row.seoTitle ?? undefined,
    seoDescription: row.seoDescription ?? undefined,
    imagePath: row.imagePath ?? undefined,
    image: row.imagePath ? getStoragePublicUrl(row.imagePath) : undefined,
    imageAlt: row.imageAlt ?? undefined,
    links,
    initiallyExpanded: row.initiallyExpanded,
    isPublished: row.isPublished,
    archivedAt: row.archivedAt?.toISOString() ?? null,
    sortOrder: row.sortOrder
  };
}

function mapItem(row: ItemRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    artistId: row.artistId,
    artistName: row.artistName,
    artistSlug: row.artistSlug,
    description: row.description,
    preview: row.preview ?? undefined,
    specs: row.specs ?? [],
    size: row.size ?? "",
    category: row.category ?? undefined,
    seoTitle: row.seoTitle ?? undefined,
    seoDescription: row.seoDescription ?? undefined,
    priceCents: row.priceCents,
    currency: row.currency,
    stockCount: row.stockCount,
    images: (row.images ?? []).map((image) => ({
      id: image.id,
      src: getStoragePublicUrl(image.storagePath),
      storagePath: image.storagePath,
      alt: image.alt ?? row.name,
      sortOrder: image.sortOrder
    })),
    orderMessage: row.orderMessage ?? `Hello ITEMS, I want to order ${row.name} by ${row.artistName}.`,
    isPublished: row.isPublished,
    archivedAt: row.archivedAt?.toISOString() ?? null,
    sortOrder: row.sortOrder
  };
}

export async function listProducts() {
  const rows = await queryRows<ItemRow>(`${itemSelect}
    where item.is_published = true and item.archived_at is null and artist.is_published = true and artist.archived_at is null
    group by item.id, artist.id
    order by item.sort_order asc, item.name asc`);
  return (rows ?? []).map(mapItem);
}

export async function getProductBySlug(slug: string) {
  const rows = await queryRows<ItemRow>(`${itemSelect}
    where item.slug = $1 and item.is_published = true and item.archived_at is null and artist.is_published = true and artist.archived_at is null
    group by item.id, artist.id
    limit 1`, [slug]);
  return rows?.[0] ? mapItem(rows[0]) : undefined;
}

export async function listProductsByArtistSlug(artistSlug: string) {
  const rows = await queryRows<ItemRow>(`${itemSelect}
    where artist.slug = $1 and item.is_published = true and item.archived_at is null and artist.is_published = true and artist.archived_at is null
    group by item.id, artist.id
    order by item.sort_order asc, item.name asc`, [artistSlug]);
  return (rows ?? []).map(mapItem);
}

export async function listArtists() {
  const rows = await queryRows<ArtistRow>(`${artistSelect}
    where artist.is_published = true and artist.archived_at is null
    group by artist.id
    order by artist.sort_order asc, artist.name asc`);
  return (rows ?? []).map(mapArtist);
}

export async function getArtistBySlug(slug: string) {
  const rows = await queryRows<ArtistRow>(`${artistSelect}
    where artist.slug = $1 and artist.is_published = true and artist.archived_at is null
    group by artist.id
    limit 1`, [slug]);
  return rows?.[0] ? mapArtist(rows[0]) : undefined;
}
