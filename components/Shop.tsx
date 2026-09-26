"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { CATEGORY_ORDER } from "@/lib/mock";
import { money } from "@/lib/money";
import type { Product } from "@/lib/types";
import { useStore } from "./Store";

const SORTS = [
  { id: "featured", label: "FEATURED" },
  { id: "low", label: "PRICE ↑" },
  { id: "high", label: "PRICE ↓" },
] as const;

export default function Shop() {
  const { products } = useStore();
  const [cat, setCat] = useState("ALL");
  const [sort, setSort] = useState<(typeof SORTS)[number]["id"]>("featured");

  const cats = useMemo(() => {
    const present = new Set(products.map((p) => p.cat));
    const ordered = [...CATEGORY_ORDER.filter((c) => present.has(c)), ...[...present].filter((c) => !CATEGORY_ORDER.includes(c)).sort()];
    return ["ALL", ...ordered].map((c) => ({ c, n: c === "ALL" ? products.length : products.filter((p) => p.cat === c).length }));
  }, [products]);

  const shown = useMemo(() => {
    let list = products.filter((p) => cat === "ALL" || p.cat === cat);
    if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [products, cat, sort]);

  return (
    <section data-screen-label="Shop" id="shop" className="zk-shop">
      <div data-reveal className="zk-shop-head">
        <div>
          <div className="zk-eyebrow">THE ARMORY / 品物</div>
          <h2 className="zk-shop-title">EVERY PIECE<br />IS A CONTRACT</h2>
        </div>
        <div className="zk-shop-controls">
          <div className="zk-shop-count">{shown.length} OF {products.length} RELICS</div>
          <div className="zk-sorts" role="group" aria-label="Sort">
            {SORTS.map((s) => (
              <button key={s.id} className={"zk-sort" + (sort === s.id ? " is-on" : "")} aria-pressed={sort === s.id} onClick={() => setSort(s.id)}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div data-reveal className="zk-cats" role="group" aria-label="Category">
        {cats.map(({ c, n }) => (
          <button key={c} className={"zk-cat" + (cat === c ? " is-on" : "")} aria-pressed={cat === c} onClick={() => setCat(c)}>
            {c}
            <span>{n}</span>
          </button>
        ))}
      </div>

      <div className="zk-grid">
        {shown.map((p) => <ProductTile key={p.id} p={p} />)}
      </div>

      {shown.length === 0 && (
        <div className="zk-empty">
          <div>THE SHELF IS BARE</div>
          <div>NO RELICS IN THIS RITE — CHOOSE ANOTHER</div>
        </div>
      )}
    </section>
  );
}

function ProductTile({ p }: { p: Product }) {
  const { add, openPdp, fav, toggleFav, tilt } = useStore();
  const square = useRef<HTMLDivElement>(null);
  const open = () => openPdp(p);

  return (
    <article className="zk-tile zk-tilt" {...tilt}>
      <div
        ref={square}
        className="zk-tile-square"
        role="button"
        tabIndex={0}
        aria-label={`View ${p.name}`}
        onClick={open}
        onKeyDown={(e) => { if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); open(); } }}
      >
        <div className="zk-hatch" />
        <div data-depth="-10" className="zk-tile-glow" />
        <div data-depth="22" data-center className="zk-tile-glyph" aria-hidden>{p.glyph}</div>
        {p.image ? (
          <div data-depth="12" className="zk-photo">
            <Image src={p.image.url} alt={p.image.alt} fill sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 25vw" style={{ objectFit: "cover" }} />
          </div>
        ) : (
          <div data-depth="34" data-center className="zk-tile-mask">
            <img src="/zenkaii-mask.png" alt="" className="zk-fill" />
          </div>
        )}
        <div className="zk-tile-glitch" aria-hidden />
        <div data-depth="-6" className="zk-tile-tags">
          {p.tags.map((t) => <span key={t}>{t}</span>)}
          {!p.available && <span>SOLD OUT</span>}
        </div>
        <button
          className={"zk-fav" + (fav[p.id] ? " is-on" : "")}
          aria-label={fav[p.id] ? "Remove from favourites" : "Add to favourites"}
          aria-pressed={!!fav[p.id]}
          onClick={(e) => { e.stopPropagation(); toggleFav(p.id); }}
        >
          ✦
        </button>
        {!p.image && <div className="zk-tile-shotlabel">[ PRODUCT SHOT — 1:1 ]</div>}
        <div className="zk-tile-add">
          <button
            disabled={!p.available}
            onClick={(e) => { e.stopPropagation(); add(p, null, square.current); }}
          >
            {p.available ? "+ ADD TO CART" : "SEALED AWAY"}
          </button>
        </div>
      </div>
      <div className="zk-tile-meta">
        <div>
          <h3>{p.name}</h3>
          <div className="zk-tile-sub">{p.jp ? p.jp + " · " : ""}{p.cat}</div>
        </div>
        <div className="zk-price">{money(p.price, p.currency)}</div>
      </div>
    </article>
  );
}
