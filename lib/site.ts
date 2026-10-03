export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
).replace(/\/$/, "");

export const productPath = (handle: string) => "/products/" + encodeURIComponent(handle);

export const HOME_TITLE = "ZENKAII — Spirit-forged apparel";
export const productTitle = (name: string) => `${name} — ZENKAII`;
export const collectionPath = (handle: string) => "/collections/" + encodeURIComponent(handle);
export const collectionTitle = (name: string) => `${name} Collection — ZENKAII`;
