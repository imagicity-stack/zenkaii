import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProducts } from "@/lib/shopify";
import { productPath, productTitle, SITE_URL } from "@/lib/site";

export const revalidate = 60;

type Props = { params: Promise<{ handle: string }> };

async function findProduct(params: Props["params"]) {
  const { handle } = await params;
  const h = decodeURIComponent(handle);
  return (await getProducts()).find((p) => p.handle === h) || null;
}

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await findProduct(params);
  if (!p) return {};
  const title = productTitle(p.name);
  const description = p.blurb.length > 160 ? p.blurb.slice(0, 157).trimEnd() + "…" : p.blurb;
  const image = p.image?.url || "/zenkaii-logo.png";
  return {
    title,
    description,
    alternates: { canonical: productPath(p.handle) },
    openGraph: { type: "website", title, description, url: productPath(p.handle), images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

// The modal itself is rendered by the storefront layout from the URL; this page only
// adds structured data so search engines see a real product page.
export default async function ProductPage({ params }: Props) {
  const p = await findProduct(params);
  if (!p) notFound();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.blurb,
    image: p.image ? [p.image.url] : [SITE_URL + "/zenkaii-mask.png"],
    category: p.cat,
    brand: { "@type": "Brand", name: "ZENKAII" },
    offers: {
      "@type": "Offer",
      url: SITE_URL + productPath(p.handle),
      price: p.price.toFixed(2),
      priceCurrency: p.currency,
      availability: p.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />;
}
