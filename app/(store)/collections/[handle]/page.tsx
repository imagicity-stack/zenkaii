import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CollectionView from "@/components/CollectionView";
import { getCharacters } from "@/lib/shopify";
import { collectionPath, collectionTitle } from "@/lib/site";

export const revalidate = 60;

type Props = { params: Promise<{ handle: string }> };

async function findCharacter(params: Props["params"]) {
  const { handle } = await params;
  const h = decodeURIComponent(handle);
  return (await getCharacters()).find((c) => c.handle === h) || null;
}

export async function generateStaticParams() {
  return (await getCharacters()).map((c) => ({ handle: c.handle }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await findCharacter(params);
  if (!c) return {};
  const title = collectionTitle(c.name);
  const description = (c.description || `${c.name} — ${c.tagline}`).slice(0, 160);
  const image = c.image?.url || "/zenkaii-logo.png";
  return {
    title,
    description,
    alternates: { canonical: collectionPath(c.handle) },
    openGraph: { type: "website", title, description, url: collectionPath(c.handle), images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function CollectionPage({ params }: Props) {
  const c = await findCharacter(params);
  if (!c) notFound();
  return <CollectionView handle={c.handle} />;
}
