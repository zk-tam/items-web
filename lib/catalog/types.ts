export type CatalogImage = {
  id?: string;
  src: string;
  alt: string;
  storagePath?: string;
  sortOrder?: number;
};

export type CatalogArtistLink = {
  id?: string;
  label: string;
  href: string;
  sortOrder?: number;
};

export type CatalogArtist = {
  id?: string;
  slug: string;
  name: string;
  role: string;
  bio?: string;
  email?: string;
  websiteUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  image?: string;
  imageAlt?: string;
  imagePath?: string;
  links: CatalogArtistLink[];
  initiallyExpanded?: boolean;
  isPublished?: boolean;
  archivedAt?: string | null;
  sortOrder?: number;
};

export type CatalogItem = {
  id?: string;
  slug: string;
  name: string;
  artistName: string;
  artistSlug: string;
  artistId?: string;
  description: string;
  preview?: string[];
  specs: string[];
  size: string;
  category?: string;
  priceCents?: number;
  currency?: string;
  stockCount?: number;
  seoTitle?: string;
  seoDescription?: string;
  priceNote?: string;
  images: CatalogImage[];
  orderMessage: string;
  isPublished?: boolean;
  archivedAt?: string | null;
  sortOrder?: number;
};
