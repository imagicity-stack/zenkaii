"use client";

import type { Product } from "@/lib/types";
import CartDrawer from "./CartDrawer";
import { Community, Lookbook, Lore } from "./Editorial";
import Effects from "./Effects";
import FeaturedDrop from "./FeaturedDrop";
import Footer from "./Footer";
import Gate from "./Gate";
import Header from "./Header";
import Hero from "./Hero";
import Newsletter from "./Newsletter";
import ProductModal from "./ProductModal";
import Shop from "./Shop";
import { StoreProvider } from "./Store";
import Ticker from "./Ticker";
import Toast from "./Toast";

export default function Zenkaii({ products, shopify }: { products: Product[]; shopify: boolean }) {
  return (
    <StoreProvider products={products} shopify={shopify}>
      <Effects />
      <Header />
      <main id="top" className="zk-main">
        <Hero />
        <Ticker />
        <FeaturedDrop />
        <Gate variant="crimson" label="II — THE MARKET" kana="いちば" />
        <Shop />
        <Gate variant="ivory" label="III — THE LOOK" kana="よそおい" />
        <Lookbook />
        <Lore />
        <Community />
        <Newsletter />
        <Footer />
      </main>
      <ProductModal />
      <CartDrawer />
      <Toast />
    </StoreProvider>
  );
}
