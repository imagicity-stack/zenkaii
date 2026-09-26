import Zenkaii from "@/components/Zenkaii";
import { getProducts, getShopLinks, shopifyEnabled } from "@/lib/shopify";

// Rebuild the catalogue from Shopify at most once a minute.
export const revalidate = 60;

// The whole storefront lives in this layout so it persists between "/" and
// "/products/[handle]": opening a product only swaps the URL and the modal.
export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [products, links] = await Promise.all([getProducts(), getShopLinks()]);
  return (
    <Zenkaii products={products} shopify={shopifyEnabled} links={links}>
      {children}
    </Zenkaii>
  );
}
