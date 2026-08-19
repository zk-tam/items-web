const LOCAL_SITE_URL = "http://localhost:3000";

export function resolveSiteUrl(value = process.env.NEXT_PUBLIC_SITE_URL) {
  try {
    const url = new URL(value || LOCAL_SITE_URL);
    if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("Unsupported protocol");
    return url.origin;
  } catch {
    return LOCAL_SITE_URL;
  }
}

export const siteUrl = resolveSiteUrl();
const parsedSiteUrl = new URL(siteUrl);
export const siteHostname = parsedSiteUrl.hostname;
export const siteDisplayHost = parsedSiteUrl.host;
