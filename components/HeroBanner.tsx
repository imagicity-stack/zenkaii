import { getImageProps } from "next/image";
import { CONFIG } from "@/lib/config";
import SectionLink from "./SectionLink";

// 1×1 transparent GIF: phones match this <source> instead, so the hero art is never downloaded there.
const BLANK = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

// Desktop-only hero above the For You carousel (hidden ≤ 760px, where the carousel leads).
export default function HeroBanner() {
  const {
    props: { srcSet, ...img },
  } = getImageProps({
    src: "/hero/legends.webp",
    alt: "Goku, Luffy, Naruto, Sailor Moon, Gojo, Ichigo, Edward, L, Levi and Tanjiro charging out of one poster",
    width: 1916,
    height: 821,
    sizes: "100vw",
    quality: 85,
  });

  return (
    <section className="zk-herob" aria-label="Zenkaii legends">
      <div data-parallax="0.12" className="zk-herob-art">
        <picture>
          <source media="(max-width: 760px)" srcSet={BLANK} />
          <source media="(min-width: 761px)" srcSet={srcSet} sizes="100vw" />
          <img {...img} fetchPriority="high" decoding="async" draggable={false} />
        </picture>
      </div>
      <div className="zk-herob-shade" aria-hidden />
      <div className="zk-herob-copy">
        <div className="zk-herob-text">
          <div className="zk-herob-eyebrow">
            <span aria-hidden />DROP {CONFIG.drop.number} — TEN LEGENDS, ONE OATH
          </div>
          <h1 className="zk-herob-title">
            WEAR THE <span>LEGEND</span>
          </h1>
        </div>
        <div className="zk-herob-ctas">
          <SectionLink to="foryou" className="zk-btn-ivory">BROWSE CHARACTERS</SectionLink>
          <SectionLink to="shop" className="zk-btn-ghost">SHOP ALL RELICS</SectionLink>
        </div>
      </div>
    </section>
  );
}
