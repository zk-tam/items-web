import { artists as seedArtists, type Artist } from "@/data/artists";
import { products as seedProducts, type Product } from "@/data/products";
import { queryRows } from "@/lib/db/postgres";

type ProductRow = Omit<Product, "artistSlug" | "artistName" | "priceNote" | "orderMessage"> & {
  artistSlug: string;
  artistName: string;
  priceNote: string | null;
  orderMessage: string;
};

type ArtistRow = Omit<Artist, "imageAlt" | "initiallyExpanded"> & {
  imageAlt: string | null;
  initiallyExpanded: boolean | null;
};

function normalizeProduct(row: ProductRow): Product {
  return {
    ...row,
    priceNote: row.priceNote ?? undefined
  };
}

function normalizeArtist(row: ArtistRow): Artist {
  return {
    ...row,
    image: row.image ?? undefined,
    imageAlt: row.imageAlt ?? undefined,
    initiallyExpanded: row.initiallyExpanded ?? undefined
  };
}

export async function listProducts() {
  try {
    const rows = await queryRows<ProductRow>(
      `
        select
          slug,
          name,
          artist_name as "artistName",
          artist_slug as "artistSlug",
          description,
          preview,
          specs,
          size,
          price_note as "priceNote",
          images,
          order_message as "orderMessage"
        from products
        order by sort_order asc, name asc
      `
    );

    return rows?.map(normalizeProduct) ?? seedProducts;
  } catch {
    return seedProducts;
  }
}

export async function getProductBySlug(slug: string) {
  const seeded = seedProducts.find((product) => product.slug === slug);

  try {
    const rows = await queryRows<ProductRow>(
      `
        select
          slug,
          name,
          artist_name as "artistName",
          artist_slug as "artistSlug",
          description,
          preview,
          specs,
          size,
          price_note as "priceNote",
          images,
          order_message as "orderMessage"
        from products
        where slug = $1
        limit 1
      `,
      [slug]
    );

    return rows?.[0] ? normalizeProduct(rows[0]) : seeded;
  } catch {
    return seeded;
  }
}

export async function listProductsByArtistSlug(artistSlug: string) {
  try {
    const rows = await queryRows<ProductRow>(
      `
        select
          slug,
          name,
          artist_name as "artistName",
          artist_slug as "artistSlug",
          description,
          preview,
          specs,
          size,
          price_note as "priceNote",
          images,
          order_message as "orderMessage"
        from products
        where artist_slug = $1
        order by sort_order asc, name asc
      `,
      [artistSlug]
    );

    return rows?.map(normalizeProduct) ?? seedProducts.filter((product) => product.artistSlug === artistSlug);
  } catch {
    return seedProducts.filter((product) => product.artistSlug === artistSlug);
  }
}

export async function listArtists() {
  try {
    const rows = await queryRows<ArtistRow>(
      `
        select
          slug,
          name,
          role,
          bio,
          image,
          image_alt as "imageAlt",
          links,
          initially_expanded as "initiallyExpanded"
        from artists
        order by sort_order asc, name asc
      `
    );

    return rows?.map(normalizeArtist) ?? seedArtists;
  } catch {
    return seedArtists;
  }
}

export async function getArtistBySlug(slug: string) {
  const seeded = seedArtists.find((artist) => artist.slug === slug);

  try {
    const rows = await queryRows<ArtistRow>(
      `
        select
          slug,
          name,
          role,
          bio,
          image,
          image_alt as "imageAlt",
          links,
          initially_expanded as "initiallyExpanded"
        from artists
        where slug = $1
        limit 1
      `,
      [slug]
    );

    return rows?.[0] ? normalizeArtist(rows[0]) : seeded;
  } catch {
    return seeded;
  }
}
