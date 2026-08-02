import "server-only";

import type { DocumentSnapshot } from "@/lib/admin/repository";

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)").replace(/[\r\n]/g, " ");
}

function money(cents: number, currency: string) {
  return `${currency} ${(cents / 100).toFixed(2)}`;
}

function textLines(document: DocumentSnapshot) {
  const issuedAt = new Intl.DateTimeFormat("en-MY", { dateStyle: "medium" }).format(new Date(document.generatedAt));
  const lines = [
    document.seller.name,
    document.kind.toUpperCase(),
    document.documentNumber,
    `Issued: ${issuedAt}`,
    "",
    `Order: ${document.orderNumber}`,
    `Customer: ${document.customer.name}`,
    document.customer.email ? `Email: ${document.customer.email}` : "",
    document.customer.phone ? `Phone: ${document.customer.phone}` : "",
    document.customer.shippingAddress ? `Address: ${document.customer.shippingAddress}` : "",
    "",
    "Items"
  ];

  for (const line of document.lines) {
    lines.push(`${line.quantity} × ${line.itemName} — ${line.artistName} — ${money(line.quantity * line.unitPriceCents, document.currency)}`);
  }

  lines.push("", `Total: ${money(document.totalCents, document.currency)}`);
  if (document.seller.address) lines.push("", document.seller.address);
  if (document.seller.email) lines.push(document.seller.email);
  if (document.seller.phone) lines.push(document.seller.phone);
  if (document.seller.taxId) lines.push(`Registration / Tax ID: ${document.seller.taxId}`);
  return lines.filter((line) => line !== undefined);
}

/** Creates a deliberately simple, dependency-free one-page PDF for invoices and receipts. */
export function createOrderPdf(document: DocumentSnapshot) {
  const lines = textLines(document).slice(0, 44);
  const text = lines.map((line, index) => {
    const y = 800 - index * 16;
    const size = index === 0 ? 20 : index === 1 ? 15 : 10;
    return `BT /F1 ${size} Tf 48 ${y} Td (${escapePdfText(line)}) Tj ET`;
  }).join("\n");
  const content = Buffer.from(text, "utf8");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${content.length} >>\nstream\n${content.toString("utf8")}\nendstream`
  ];
  const chunks: Buffer[] = [Buffer.from("%PDF-1.4\n", "utf8")];
  const offsets = [0];
  let position = chunks[0].length;
  for (const [index, object] of objects.entries()) {
    offsets.push(position);
    const buffer = Buffer.from(`${index + 1} 0 obj\n${object}\nendobj\n`, "utf8");
    chunks.push(buffer);
    position += buffer.length;
  }
  const xrefPosition = position;
  const xref = ["xref", `0 ${objects.length + 1}`, "0000000000 65535 f ", ...offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n `)].join("\n");
  chunks.push(Buffer.from(`${xref}\ntrailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPosition}\n%%EOF`, "utf8"));
  return Buffer.concat(chunks);
}
