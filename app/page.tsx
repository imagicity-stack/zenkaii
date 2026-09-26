import Zenkaii from "@/components/Zenkaii";
import { getProducts, shopifyEnabled } from "@/lib/shopify";

// Rebuild the catalogue from Shopify at most once a minute.
export const revalidate = 60;

export default async function Page() {
  const products = await getProducts();
  return <Zenkaii products={products} shopify={shopifyEnabled} />;
}
