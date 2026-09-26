import { HERO_STATS } from "@/lib/content";
import SectionLink from "./SectionLink";

export default function Hero() {
  return (
    <section data-screen-label="Hero" className="zk-hero">
      <div data-parallax="0.28" data-center className="zk-hero-bgword">ZENKAII</div>
      <div data-parallax="-0.16" data-center className="zk-hero-glowwrap">
        <div className="zk-hero-glow" />
      </div>

      <div data-parallax="0.1" className="zk-hero-maskwrap">
        <div className="zk-hero-mask">
          <img src="/zenkaii-mask.png" alt="Zenkaii kitsune mask" className="zk-fill zk-hero-mask-img" />
          <div className="zk-hero-glint">
            <div />
          </div>
        </div>
      </div>

      <div data-reveal className="zk-hero-copy">
        <div className="zk-hero-eyebrow">
          <span />SPIRIT-FORGED APPAREL<span />
        </div>
        <h1 className="zk-hero-title">
          WEAR THE<br />
          <span>MASK</span> YOU<br />
          WERE OWED
        </h1>
        <p className="zk-hero-lede">
          Nine tails, nine oaths. Every garment is struck once, numbered, and sealed with the fox&apos;s mark — then the mould is broken. What passes the gate does not return.
        </p>
        <div className="zk-hero-ctas">
          <SectionLink to="shop" className="zk-btn-ivory">ENTER THE SHRINE</SectionLink>
          <SectionLink to="lore" className="zk-btn-ghost">READ THE OATH</SectionLink>
        </div>
        <div className="zk-hero-stats">
          {HERO_STATS.map((s) => (
            <div key={s.k}>
              <span className="zk-hero-stat-v">{s.v}</span>
              <span className="zk-hero-stat-k">{s.k}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="zk-hero-scroll" aria-hidden>
        SCROLL
        <div />
      </div>
    </section>
  );
}
