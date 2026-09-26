"use client";

import { LOOKBOOK, OATHS, UGC } from "@/lib/content";
import { useStore } from "./Store";

export function Lookbook() {
  return (
    <section data-screen-label="Lookbook" id="lookbook" className="zk-lookbook">
      <div data-reveal className="zk-lookbook-head">
        <h2>
          LOOKBOOK<br />
          <span>冬 / WINTER RITE</span>
        </h2>
        <p>Shot at dusk in Kurama, on film, with no light but the lanterns. Four chapters, forty frames, one mask that refused to come off.</p>
      </div>
      <div className="zk-lookbook-grid">
        {LOOKBOOK.map((l) => (
          <figure key={l.no} data-reveal data-wipe className="zk-look" style={{ aspectRatio: l.ratio }}>
            <div className="zk-look-hatch" />
            <div data-parallax={l.p} data-center className="zk-look-no" aria-hidden>{l.no}</div>
            <div className="zk-look-glow" />
            <figcaption>
              <div className="zk-look-title">{l.title}</div>
              <div className="zk-look-meta">[ EDITORIAL — {l.ratio} ] · {l.meta}</div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export function Lore() {
  return (
    <section data-screen-label="Lore" id="lore" className="zk-lore">
      <div data-parallax="-0.14" className="zk-lore-glyph" aria-hidden>誓</div>
      <div className="zk-lore-inner">
        <div data-reveal className="zk-lore-head">
          <div className="zk-eyebrow">THE NINE OATHS / 九つの誓い</div>
          <h2>WHAT THE FOX<br />ASKED FOR</h2>
          <p>Zenkaii began as a debt. A mask left at a mountain shrine in exchange for a single winter. We have been paying it back in cotton and resin ever since.</p>
        </div>
        <div>
          {OATHS.map((o) => (
            <div key={o.n} data-reveal className="zk-oath">
              <div className="zk-oath-n">
                <div>{o.n}</div>
                <div className="zk-oath-line" />
              </div>
              <div>
                <h3>{o.title}</h3>
                <p>{o.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Community() {
  const { tilt } = useStore();
  return (
    <section data-screen-label="Community" id="community" className="zk-community">
      <div data-reveal className="zk-community-head">
        <div className="zk-eyebrow">THE MASKED / 仲間</div>
        <h2>14,280 WEARERS<br />AND COUNTING</h2>
        <p>Tag <strong>#ZENKAIIOATH</strong> and your frame goes on the wall. Best of each moon ships free.</p>
      </div>
      <div className="zk-ugc-grid">
        {UGC.map((u) => (
          <div key={u.handle} data-reveal className="zk-ugc zk-tilt" style={{ aspectRatio: u.ratio }} {...tilt}>
            <div className="zk-ugc-hatch" />
            <div data-depth="16" data-center className="zk-ugc-mask">
              <img src="/zenkaii-mask.png" alt="" className="zk-fill" />
            </div>
            <div className="zk-ugc-glitch" aria-hidden />
            <div className="zk-ugc-meta">
              <span>{u.handle}</span>
              <span className="zk-ugc-likes">♦ {u.likes}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
