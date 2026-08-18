import { SEO_DESCRIPTION_MAX_LENGTH, SEO_TITLE_MAX_LENGTH } from "../seo/constants";
import { getItemMediaMimeType, isDirectCatalogMediaPath, itemMediaMimeTypes, MAX_ITEM_MEDIA, MAX_ITEM_MEDIA_ALT_LENGTH, type CatalogMediaArea, type ItemMediaOrderEntry } from "./item-media";

type LinkInput = { label: string; url: string };

const slugPattern = /^[@_.]*[a-z0-9][a-z0-9@_.]*(?:-[@_.]*[a-z0-9][a-z0-9@_.]*)*$/;

export function requiredText(value: FormDataEntryValue | null, label: string) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) {
    throw new Error(`${label} is required.`);
  }
  return text;
}

export function optionalText(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value.trim() : "";
  return text || null;
}

function optionalTextWithinLimit(value: FormDataEntryValue | null, label: string, maximumLength: number) {
  const text = optionalText(value);
  if (text && text.length > maximumLength) {
    throw new Error(`${label} must be ${maximumLength} characters or fewer.`);
  }
  return text;
}

export function parseSeoTitle(value: FormDataEntryValue | null) {
  return optionalTextWithinLimit(value, "SEO page title", SEO_TITLE_MAX_LENGTH);
}

export function parseSeoDescription(value: FormDataEntryValue | null) {
  return optionalTextWithinLimit(value, "SEO meta description", SEO_DESCRIPTION_MAX_LENGTH);
}

export function parseSlug(value: FormDataEntryValue | null) {
  const slug = requiredText(value, "Slug").toLowerCase();
  if (!slugPattern.test(slug)) {
    throw new Error("Slug may contain lowercase letters, numbers, @, periods, underscores, and single hyphens only.");
  }
  return slug;
}

export function parseOptionalUrl(value: FormDataEntryValue | null, label: string) {
  const url = optionalText(value);
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      throw new Error();
    }
  } catch {
    throw new Error(`${label} must be a valid http(s) URL.`);
  }
  return url;
}

export function parseNonNegativeInteger(value: FormDataEntryValue | null, label: string, fallback = 0) {
  const text = optionalText(value);
  if (!text) {
    return fallback;
  }
  const number = Number(text);
  if (!Number.isInteger(number) || number < 0) {
    throw new Error(`${label} must be a non-negative whole number.`);
  }
  return number;
}

export function parseOptionalNonNegativeInteger(value: FormDataEntryValue | null, label: string) {
  const text = optionalText(value);
  if (!text) {
    return null;
  }
  const number = Number(text);
  if (!Number.isInteger(number) || number < 0) {
    throw new Error(`${label} must be a non-negative whole number.`);
  }
  return number;
}

export function parsePriceCents(value: FormDataEntryValue | null) {
  return parseOptionalPriceCents(value) ?? 0;
}

export function parseOptionalPriceCents(value: FormDataEntryValue | null, label = "Price") {
  const text = optionalText(value);
  if (!text) return null;
  if (!/^\d+(?:\.\d{1,2})?$/.test(text)) {
    throw new Error(`${label} must be a valid amount with at most two decimal places.`);
  }
  const [whole, fraction = ""] = text.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}

export function parseLines(value: FormDataEntryValue | null) {
  const text = optionalText(value);
  return text
    ? text.split("\n").map((line) => line.trim()).filter(Boolean)
    : [];
}

export function parseLinks(value: FormDataEntryValue | null): LinkInput[] {
  return parseLines(value).map((line) => {
    const separator = line.indexOf("|");
    const label = separator < 0 ? null : line.slice(0, separator).trim();
    const url = separator < 0 ? line : line.slice(separator + 1).trim();
    const validUrl = parseOptionalUrl(url, label ? `Social link ${label}` : "Social link");

    if (!validUrl) {
      throw new Error("Each social link must include an http(s) URL.");
    }

    const hostname = new URL(validUrl).hostname.toLowerCase().replace(/^www\./, "");
    const inferredLabel = hostname === "instagram.com" || hostname.endsWith(".instagram.com")
      ? "Instagram"
      : hostname;

    return { label: label || inferredLabel, url: validUrl };
  });
}

function parseCatalogMediaOrder(value: FormDataEntryValue | null, area: CatalogMediaArea): ItemMediaOrderEntry[] | null {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error("Media order is invalid.");
  }

  if (!Array.isArray(parsed) || parsed.length > MAX_ITEM_MEDIA) {
    throw new Error(`A ${area === "artists" ? "artist" : "item"} can have at most ${MAX_ITEM_MEDIA} media files.`);
  }

  const identifiers = new Set<string>();
  return parsed.map((entry): ItemMediaOrderEntry => {
    if (!entry || typeof entry !== "object") {
      throw new Error("Media order is invalid.");
    }

    const candidate = entry as Record<string, unknown>;
    const altText = typeof candidate.altText === "string" ? candidate.altText.trim() || null : null;
    if (altText && altText.length > MAX_ITEM_MEDIA_ALT_LENGTH) {
      throw new Error(`Media alt text must be ${MAX_ITEM_MEDIA_ALT_LENGTH} characters or fewer.`);
    }

    if (candidate.kind === "existing" && typeof candidate.id === "string" && candidate.id.length > 0) {
      const identifier = `existing:${candidate.id}`;
      if (identifiers.has(identifier)) throw new Error("Media order contains duplicates.");
      identifiers.add(identifier);
      return { kind: "existing", id: candidate.id, altText };
    }

    const mediaType = candidate.mediaType === "image" || candidate.mediaType === "video" ? candidate.mediaType : null;
    const mimeType = typeof candidate.mimeType === "string" ? getItemMediaMimeType(candidate.mimeType) : null;
    const storagePath = typeof candidate.storagePath === "string" ? candidate.storagePath : null;
    if (candidate.kind === "new" && mediaType && mimeType && storagePath && isDirectCatalogMediaPath(area, storagePath) && itemMediaMimeTypes[mimeType].kind === mediaType) {
      const identifier = `new:${storagePath}`;
      if (identifiers.has(identifier)) throw new Error("Media order contains duplicates.");
      identifiers.add(identifier);
      return { kind: "new", storagePath, mediaType, mimeType, altText };
    }

    throw new Error("Media order is invalid.");
  });
}

export function parseItemMediaOrder(value: FormDataEntryValue | null) {
  return parseCatalogMediaOrder(value, "items");
}

export function parseArtistMediaOrder(value: FormDataEntryValue | null) {
  return parseCatalogMediaOrder(value, "artists");
}

export function isChecked(value: FormDataEntryValue | null) {
  return value === "on";
}
