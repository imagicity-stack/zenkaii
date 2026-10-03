import type { MetadataRoute } from "next";
import { getCharacters, getProducts } from "@/lib/shopify";
import { collectionPath, productPath, SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, characters] = await Promise.all([getProducts(), getCharacters()]);
  return [
    { url: SITE_URL + "/", changeFrequency: "daily", priority: 1 },
    ...characters.map((c) => ({ url: SITE_URL + collectionPath(c.handle), changeFrequency: "weekly" as const, priority: 0.9 })),
    ...products.map((p) => ({ url: SITE_URL + productPath(p.handle), changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
