import "server-only";

import path from "node:path";
import sharp from "sharp";
import type { DocumentSnapshot } from "@/lib/admin/repository";
import { getStoragePublicUrl } from "@/lib/storage/supabase-storage";

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const PAGE_INSET = 38;

const BLUE = "0.039 0.306 0.965";
const INK = "0.09 0.102 0.125";
const MUTED = "0.42 0.44 0.48";
const BORDER = "0.87 0.89 0.93";

type PdfPage = {
  operations: string[];
  cursor: number;
};

type PdfImage = {
  key: string;
  width: number;
  height: number;
  data: Buffer;
};

function escapePdfText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, "\"")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[^\x20-\x7E]/g, "?")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[\r\n]/g, " ");
}

function money(cents: number, currency: string) {
  return `${currency} ${(cents / 100).toFixed(2)}`;
}

function date(value: string | undefined) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-MY", { dateStyle: "medium" }).format(new Date(value));
}

function label(value: string | undefined) {
  return value ? value.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase()) : "-";
}

function wrap(value: string, maxCharacters: number) {
  const words = value.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxCharacters && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.length > 0 ? lines : [""];
}

function text(page: PdfPage, value: string, x: number, y: number, size: number, options: { font?: "F1" | "F2"; color?: string } = {}) {
  page.operations.push(`BT /${options.font ?? "F1"} ${size} Tf ${options.color ?? INK} rg 1 0 0 1 ${x} ${y} Tm (${escapePdfText(value)}) Tj ET`);
}

function rule(page: PdfPage, x1: number, y: number, x2: number, color = BORDER, width = 0.75) {
  page.operations.push(`q ${color} RG ${width} w ${x1} ${y} m ${x2} ${y} l S Q`);
}

function verticalRule(page: PdfPage, x: number, y1: number, y2: number, color = BORDER, width = 0.75) {
  page.operations.push(`q ${color} RG ${width} w ${x} ${y1} m ${x} ${y2} l S Q`);
}

function image(page: PdfPage, key: string, x: number, y: number, width: number, height: number) {
  page.operations.push(`q ${width} 0 0 ${height} ${x} ${y} cm /${key} Do Q`);
}

function header(page: PdfPage, document: DocumentSnapshot, continuation = false, logo?: PdfImage) {
  if (logo) {
    image(page, logo.key, PAGE_INSET, PAGE_HEIGHT - 55, 112, 35);
  } else {
    text(page, "ITEMS", PAGE_INSET, PAGE_HEIGHT - 50, 23, { font: "F2", color: BLUE });
    text(page, "IDEAS YOU WANT, PLUS SOME.", PAGE_INSET + 75, PAGE_HEIGHT - 47, 6.5, { font: "F2", color: MUTED });
  }
  text(page, continuation ? `${document.kind.toUpperCase()} / CONTINUED` : document.kind.toUpperCase(), 447, PAGE_HEIGHT - 46, 8.5, { font: "F2", color: MUTED });
  rule(page, PAGE_INSET, PAGE_HEIGHT - 69, PAGE_WIDTH - PAGE_INSET);
  text(page, continuation ? "Order items" : `#${document.documentNumber}`, PAGE_INSET, PAGE_HEIGHT - 106, continuation ? 18 : 22, { font: "F2" });
  if (continuation) {
    text(page, `Order ${document.orderNumber}`, PAGE_INSET, PAGE_HEIGHT - 123, 9.5, { font: "F2", color: MUTED });
  } else {
    text(page, `Issued ${date(document.generatedAt)}  |  Order ${document.orderNumber}`, PAGE_INSET, PAGE_HEIGHT - 125, 9.5, { color: MUTED });
  }
  page.cursor = PAGE_HEIGHT - 154;
}

function orderOverview(page: PdfPage, document: DocumentSnapshot) {
  const addressLines = document.customer.shippingAddress ? document.customer.shippingAddress.split(/\r?\n/).flatMap((line) => wrap(line, 30)) : [];
  const contactLines = [document.customer.email, document.customer.phone].filter(Boolean);
  const height = Math.max(128, 80 + (contactLines.length + addressLines.length) * 11);
  const top = page.cursor;
  const bottom = top - height;
  const dividerX = PAGE_INSET + 246;
  const customerX = dividerX + 20;

  rule(page, PAGE_INSET, top, PAGE_WIDTH - PAGE_INSET, BLUE, 1);
  verticalRule(page, dividerX, bottom + 13, top - 13, BLUE, 1);

  text(page, "ORDER STATUS", PAGE_INSET, top - 24, 7.5, { font: "F2", color: MUTED });
  text(page, label(document.orderStatus), PAGE_INSET, top - 51, 15, { font: "F2", color: BLUE });
  text(page, "PAYMENT", PAGE_INSET, top - 79, 7.2, { font: "F2", color: MUTED });
  text(page, label(document.paymentStatus), PAGE_INSET, top - 97, 10.5, { font: "F2" });
  text(page, "PLACED", PAGE_INSET + 132, top - 79, 7.2, { font: "F2", color: MUTED });
  text(page, date(document.createdAt), PAGE_INSET + 132, top - 97, 10, { font: "F2" });

  text(page, "CUSTOMER", customerX, top - 24, 7.5, { font: "F2", color: MUTED });
  text(page, document.customer.name, customerX, top - 46, 11, { font: "F2" });
  let y = top - 64;
  for (const line of contactLines) {
    text(page, line!, customerX, y, 8.4, { color: MUTED });
    y -= 11;
  }
  if (addressLines.length > 0) {
    y -= 4;
    text(page, "SHIPPING ADDRESS", customerX, y, 6.7, { font: "F2", color: MUTED });
    y -= 13;
    for (const line of addressLines) {
      text(page, line, customerX, y, 8.2, { color: MUTED });
      y -= 11;
    }
  }
  page.cursor = bottom - 30;
}

function itemHeading(page: PdfPage) {
  rule(page, PAGE_INSET, page.cursor, PAGE_WIDTH - PAGE_INSET, BLUE, 1);
  text(page, "ORDER ITEMS", PAGE_INSET, page.cursor - 23, 7.5, { font: "F2", color: MUTED });
  text(page, "QTY", 408, page.cursor - 23, 7.5, { font: "F2", color: MUTED });
  text(page, "TOTAL", 482, page.cursor - 23, 7.5, { font: "F2", color: MUTED });
  page.cursor -= 43;
}

function itemRow(page: PdfPage, line: DocumentSnapshot["lines"][number], currency: string, thumbnail?: PdfImage) {
  const itemLines = wrap(line.itemName, 38);
  const height = Math.max(58, 27 + itemLines.length * 12);
  const thumbnailSize = Math.min(40, height - 14);
  const thumbnailX = PAGE_INSET;
  const thumbnailY = page.cursor - height + (height - thumbnailSize) / 2;
  if (thumbnail) {
    image(page, thumbnail.key, thumbnailX, thumbnailY, thumbnailSize, thumbnailSize);
  } else {
    text(page, String(line.quantity).padStart(2, "0"), thumbnailX, thumbnailY + 12, 9, { font: "F2", color: BLUE });
  }
  let titleY = page.cursor - 18;
  for (const itemName of itemLines) {
    text(page, itemName, PAGE_INSET + 57, titleY, 10, { font: "F2" });
    titleY -= 12;
  }
  text(page, line.artistName, PAGE_INSET + 57, page.cursor - height + 13, 8.3, { color: MUTED });
  text(page, `${line.quantity} x`, 404, page.cursor - height / 2 + 3, 9, { color: MUTED });
  text(page, money(line.quantity * line.unitPriceCents, currency), 458, page.cursor - height / 2 + 3, 9.5, { font: "F2" });
  rule(page, PAGE_INSET, page.cursor - height, PAGE_WIDTH - PAGE_INSET);
  page.cursor -= height + 8;
}

function totals(page: PdfPage, document: DocumentSnapshot) {
  const x = 360;
  const top = page.cursor - 4;
  text(page, "PAYMENT SUMMARY", x, top - 23, 7.5, { font: "F2", color: MUTED });
  text(page, "Items", x, top - 47, 9, { color: MUTED });
  text(page, String(document.lines.reduce((total, line) => total + line.quantity, 0)), PAGE_WIDTH - PAGE_INSET - 8, top - 47, 9, { font: "F2" });
  rule(page, x, top - 58, PAGE_WIDTH - PAGE_INSET);
  text(page, "Total", x, top - 83, 11, { font: "F2" });
  text(page, money(document.totalCents, document.currency), 456, top - 84, 13, { font: "F2", color: BLUE });
  page.cursor = top - 126;
}

function footer(page: PdfPage, document: DocumentSnapshot) {
  rule(page, PAGE_INSET, 68, PAGE_WIDTH - PAGE_INSET);
  text(page, `Thank you for supporting ${document.seller.name}.`, PAGE_INSET, 47, 8.5, { color: MUTED });
  const sellerContact = [document.seller.email, document.seller.phone].filter(Boolean).join("  |  ");
  if (sellerContact) text(page, sellerContact, PAGE_INSET, 32, 8, { color: MUTED });
}

function buildPdf(pages: PdfPage[], images: PdfImage[]) {
  const pageObjectStart = 3;
  const fontRegularObject = pageObjectStart + pages.length;
  const fontBoldObject = fontRegularObject + 1;
  const contentObjectStart = fontBoldObject + 1;
  const imageObjectStart = contentObjectStart + pages.length;
  const objects: Array<string | Buffer> = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    `<< /Type /Pages /Kids [${pages.map((_, index) => `${pageObjectStart + index} 0 R`).join(" ")}] /Count ${pages.length} >>`
  ];

  const imageResources = images.length > 0
    ? `/XObject << ${images.map((image, index) => `/${image.key} ${imageObjectStart + index} 0 R`).join(" ")} >>`
    : "";
  for (const [index] of pages.entries()) {
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${fontRegularObject} 0 R /F2 ${fontBoldObject} 0 R >> ${imageResources} >> /Contents ${contentObjectStart + index} 0 R >>`);
  }
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
  for (const page of pages) {
    const content = page.operations.join("\n");
    objects.push(`<< /Length ${Buffer.byteLength(content, "utf8")} >>\nstream\n${content}\nendstream`);
  }
  for (const image of images) {
    objects.push(Buffer.concat([
      Buffer.from(`<< /Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.data.length} >>\nstream\n`, "utf8"),
      image.data,
      Buffer.from("\nendstream", "utf8")
    ]));
  }

  const chunks: Buffer[] = [Buffer.from("%PDF-1.4\n", "utf8")];
  const offsets = [0];
  let position = chunks[0].length;
  for (const [index, object] of objects.entries()) {
    offsets.push(position);
    const body = typeof object === "string" ? Buffer.from(object, "utf8") : object;
    const buffer = Buffer.concat([
      Buffer.from(`${index + 1} 0 obj\n`, "utf8"),
      body,
      Buffer.from("\nendobj\n", "utf8")
    ]);
    chunks.push(buffer);
    position += buffer.length;
  }
  const xrefPosition = position;
  const xref = ["xref", `0 ${objects.length + 1}`, "0000000000 65535 f ", ...offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n `)].join("\n");
  chunks.push(Buffer.from(`${xref}\ntrailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPosition}\n%%EOF`, "utf8"));
  return Buffer.concat(chunks);
}

/** Creates a card-based invoice/receipt PDF with ITEMS blue used as the accent color. */
async function loadInvoiceThumbnails(document: DocumentSnapshot) {
  const paths = [...new Set(document.lines.map((line) => line.thumbnailPath).filter((path): path is string => Boolean(path)))];
  const results: Array<readonly [string, PdfImage] | null> = await Promise.all(paths.map(async (path, index) => {
    try {
      const response = await fetch(getStoragePublicUrl(path), { cache: "force-cache" });
      if (!response.ok) return null;
      const normalized = await sharp(Buffer.from(await response.arrayBuffer()))
        .resize(80, 80, { fit: "cover", position: "centre" })
        .jpeg({ quality: 76, mozjpeg: true })
        .toBuffer({ resolveWithObject: true });
      return [path, { key: `Im${index + 1}`, width: normalized.info.width, height: normalized.info.height, data: normalized.data }] as const;
    } catch {
      return null;
    }
  }));
  return new Map(results.filter((result): result is readonly [string, PdfImage] => result !== null));
}

async function loadInvoiceLogo() {
  try {
    const source = path.join(process.cwd(), "public", "assets", "logo-horizontal.svg");
    const normalized = await sharp(source)
      .resize(224, 70, { fit: "contain", background: "#ffffff" })
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 90, mozjpeg: true })
      .toBuffer({ resolveWithObject: true });
    return { key: "BrandLogo", width: normalized.info.width, height: normalized.info.height, data: normalized.data } satisfies PdfImage;
  } catch {
    return null;
  }
}

/** Creates a card-based invoice/receipt PDF with ITEMS blue used as the accent color. */
export async function createOrderPdf(document: DocumentSnapshot) {
  const [logo, thumbnails] = await Promise.all([loadInvoiceLogo(), loadInvoiceThumbnails(document)]);
  const pages: PdfPage[] = [];
  const startPage = (continuation = false) => {
    const page: PdfPage = { operations: [], cursor: 0 };
    header(page, document, continuation, logo ?? undefined);
    pages.push(page);
    return page;
  };

  let page = startPage();
  orderOverview(page, document);
  itemHeading(page);

  for (const line of document.lines) {
    const requiredHeight = Math.max(58, 27 + wrap(line.itemName, 38).length * 12) + 8;
    if (page.cursor - requiredHeight < 170) {
      page = startPage(true);
      itemHeading(page);
    }
    itemRow(page, line, document.currency, line.thumbnailPath ? thumbnails.get(line.thumbnailPath) : undefined);
  }

  if (page.cursor < 180) {
    page = startPage(true);
  }
  totals(page, document);
  footer(page, document);
  return buildPdf(pages, [...(logo ? [logo] : []), ...thumbnails.values()]);
}
