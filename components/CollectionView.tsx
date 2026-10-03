"use client";

import Image from "next/image";
import { useMemo } from "react";
import { CharacterCard, CharacterPlaceholder } from "./ForYou";
import Rail from "./Rail";
import SectionLink from "./SectionLink";
import { ProductTile } from "./Shop";
import { useStore } from "./Store";

// /collections/<handle>: one character's banner, every relic in the collection, then more characters.
export default function CollectionView({ handle }: { handle: string }) {
  const { characters, products, followed, toggleFollow } = useStore();
  const c = characters.find((x) => x.handle === handle);
  const items = useMemo(() => (c ? products.filter((p) => c.productIds.includes(p.id)) : []), [c, products]);
  if (!c) return null;
  const on = !!followed[c.handle];
  const others = characters.filter((x) => x.handle !== c.handle);

  return (
    <div className="zk-coll" style={{ "--hue": c.hue } as React.CSSProperties}>
      <section className="zk-coll-hero" aria-label={c.name}>
        <div className="zk-coll-bg" aria-hidden>
          {c.image ? <Image src={c.image.url} alt="" fill priority sizes="100vw" style={{ objectFit: "cover" }} /> : <div className="zk-coll-bg-ph" />}
        </div>
        <div className="zk-coll-inner">
          <div className="zk-coll-poster">
            <div className="zk-char-art">
              {c.image ? <Image src={c.image.url} alt={c.image.alt} fill priority sizes="(max-width: 760px) 70vw, 340px" style={{ objectFit: "cover" }} /> : <CharacterPlaceholder c={c} />}
            </div>
            {c.badge && <div className="zk-char-badge">{c.badge}</div>}
          </div>
          <div className="zk-coll-info">
            <SectionLink to="foryou" className="zk-coll-back">← ALL CHARACTERS</SectionLink>
            <div className="zk-eyebrow">CHARACTER COLLECTION{c.jp ? " / " + c.jp : ""}</div>
            <h1 className="zk-coll-name">{c.name}</h1>
            {c.tagline && <div className="zk-coll-tagline">{c.tagline}</div>}
            <div className="zk-coll-meta">
              {[c.year, ...c.genres, `${items.length} relic${items.length === 1 ? "" : "s"}`].join(" • ")}
            </div>
            {c.description && <p className="zk-coll-desc">{c.description}</p>}
            <div className="zk-coll-actions">
              <a
                href="#relics"
                className="zk-btn-crimson"
                onClick={(e) => { e.preventDefault(); document.getElementById("relics")?.scrollIntoView(); }}
              >
                ▶ SHOP THE COLLECTION
              </a>
              <button className={"zk-coll-follow" + (on ? " is-on" : "")} aria-pressed={on} onClick={() => toggleFollow(c)}>
                {on ? "✓ FOLLOWING" : "+ FOLLOW"}
              </button>
            </div>
            {c.ribbon && <div className="zk-char-ribbon zk-coll-ribbon">{c.ribbon}</div>}
          </div>
        </div>
      </section>

      <section id="relics" className="zk-shop zk-coll-relics">
        <div data-reveal className="zk-shop-head">
          <div>
            <div className="zk-eyebrow">THE {c.name.toUpperCase()} RELICS</div>
            <h2 className="zk-shop-title">{items.length} PIECE{items.length === 1 ? "" : "S"}<br />IN THIS OATH</h2>
          </div>
        </div>
        {items.length ? (
          <div className="zk-grid">
            {items.map((p) => <ProductTile key={p.id} p={p} />)}
          </div>
        ) : (
          <div className="zk-empty">
            <div>THE SHELF IS BARE</div>
            <div>THIS CHARACTER&apos;S RELICS ARE STILL IN THE KILN</div>
          </div>
        )}
      </section>

      {others.length > 0 && (
        <Rail title="More characters" sub="キャラ" className="zk-rail--chars">
          {others.map((x) => <CharacterCard key={x.handle} c={x} compact />)}
        </Rail>
      )}
    </div>
  );
}
