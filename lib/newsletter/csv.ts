export type NewsletterSubscriberCsvRow = {
  email: string;
  subscribedAt: Date;
};

function escapeCsvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

export function newsletterSubscribersCsv(subscribers: NewsletterSubscriberCsvRow[]) {
  const rows = ["Email,Subscribed at (UTC)"];

  for (const subscriber of subscribers) {
    rows.push([
      escapeCsvCell(subscriber.email),
      escapeCsvCell(subscriber.subscribedAt.toISOString())
    ].join(","));
  }

  return `\uFEFF${rows.join("\r\n")}\r\n`;
}
