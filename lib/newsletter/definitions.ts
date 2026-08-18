export const NEWSLETTER_EMAIL_MAX_LENGTH = 254;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseNewsletterEmail(value: unknown) {
  if (typeof value !== "string") return null;

  const email = value.trim().toLowerCase();
  return email.length > 0 && email.length <= NEWSLETTER_EMAIL_MAX_LENGTH && EMAIL_PATTERN.test(email) ? email : null;
}
