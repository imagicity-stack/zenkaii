"use client";

import { Community, Lookbook, Lore } from "./Editorial";
import FeaturedDrop from "./FeaturedDrop";
import ForYou from "./ForYou";
import Gate from "./Gate";
import Newsletter from "./Newsletter";
import ProductRails from "./ProductRails";
import Shop from "./Shop";
import Ticker from "./Ticker";

// The home page: streaming-style browse up top, the original Zenkaii story below.
export default function HomeView() {
  return (
    <>
      <ForYou />
      <Ticker />
      <ProductRails />
      <FeaturedDrop />
      <Gate variant="crimson" label="II — THE MARKET" kana="いちば" />
      <Shop />
      <Gate variant="ivory" label="III — THE LOOK" kana="よそおい" />
      <Lookbook />
      <Lore />
      <Community />
      <Newsletter />
    </>
  );
}
