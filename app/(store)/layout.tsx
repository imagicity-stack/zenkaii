import Zenkaii from "@/components/Zenkaii";
import { getCharacters, getProducts, getShopLinks, shopifyEnabled } from "@/lib/shopify";

// Rebuild the catalogue from Shopify at most once a minute.
export const revalidate = 60;

// The shell (header, tab bar, modal, cart) lives in this layout so it persists across
// "/", "/products/[handle]" and "/collections/[handle]" without reloading.
export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [products, characters, links] = await Promise.all([getProducts(), getCharacters(), getShopLinks()]);
  return (
    <Zenkaii products={products} characters={characters} shopify={shopifyEnabled} links={links}>
      {children}
    </Zenkaii>
  );
}
