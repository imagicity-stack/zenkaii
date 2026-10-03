"use client";

import type { Character, Product, ShopLinks } from "@/lib/types";
import CartDrawer from "./CartDrawer";
import Effects from "./Effects";
import Footer from "./Footer";
import Header from "./Header";
import MobileNav from "./MobileNav";
import ProductModal from "./ProductModal";
import SearchOverlay from "./SearchOverlay";
import { StoreProvider } from "./Store";
import Toast from "./Toast";

// App shell shared by every storefront route; the page supplies <main>'s content.
export default function Zenkaii({
  products,
  characters,
  shopify,
  links,
  children,
}: {
  products: Product[];
  characters: Character[];
  shopify: boolean;
  links: ShopLinks;
  children?: React.ReactNode;
}) {
  return (
    <StoreProvider products={products} characters={characters} shopify={shopify}>
      <Effects />
      <Header />
      <main id="top" className="zk-main">
        {children}
        <Footer links={links} />
      </main>
      <MobileNav />
      <SearchOverlay />
      <ProductModal />
      <CartDrawer />
      <Toast />
    </StoreProvider>
  );
}
