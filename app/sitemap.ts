import type { MetadataRoute } from "next";
import { getCharacters, getProducts } from "@/lib/shopify";
import { collectionPath, productPath, SITE_URL } from "@/lib/site";

// Served at /sitemap.xml and referenced from /robots.txt; rebuilt at most hourly so new
// Shopify products and collections appear without a redeploy.
export const revalidate = 3600;

const abs = (url: string) => (url.startsWith("http") ? url : SITE_URL + url);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, characters] = await Promise.all([getProducts(), getCharacters()]);
  const lastModified = new Date();
  return [
    {
      url: SITE_URL + "/",
      lastModified,
      changeFrequency: "daily",
      priority: 1,
      images: [abs("/hero/legends.webp"), ...characters.flatMap((c) => (c.image ? [abs(c.image.url)] : []))],
    },
    ...characters.map((c) => ({
      url: SITE_URL + collectionPath(c.handle),
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.9,
      ...(c.image ? { images: [abs(c.image.url)] } : {}),
    })),
    ...products.map((p) => ({
      url: SITE_URL + productPath(p.handle),
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      ...(p.image ? { images: [abs(p.image.url)] } : {}),
    })),
  ];
}
