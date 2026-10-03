"use client";

import Image from "next/image";
import { useMemo, useRef } from "react";
import { CATEGORY_ORDER } from "@/lib/mock";
import { money } from "@/lib/money";
import type { Product } from "@/lib/types";
import Rail from "./Rail";
import { useStore } from "./Store";

export const CATEGORY_JP: Record<string, string> = {
  TEES: "Tシャツ", OUTERWEAR: "上着", MASKS: "面", FIGURES: "像", PRINTS: "版画",
  PINS: "章", DESK: "机", BOOKS: "書", BAGS: "鞄",
};

export const railId = (cat: string) => "rail-" + cat.toLowerCase().replace(/[^a-z0-9]+/g, "-");

const titleCase = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

export function useCategories() {
  const { products } = useStore();
  return useMemo(() => {
    const present = new Set(products.map((p) => p.cat));
    return [...CATEGORY_ORDER.filter((c) => present.has(c)), ...[...present].filter((c) => !CATEGORY_ORDER.includes(c)).sort()];
  }, [products]);
}

// Streaming-style rows under the carousel: recently viewed, everything new, then one row per category.
export default function ProductRails() {
  const { products, recent } = useStore();
  const cats = useCategories();
  const recentProducts = useMemo(
    () => recent.map((id) => products.find((p) => p.id === id)).filter((p): p is Product => !!p),
    [recent, products]
  );

  return (
    <div id="browse" className="zk-rails">
      {recentProducts.length > 0 && (
        <Rail title="Pick up the trail" sub="RECENTLY VIEWED" className="zk-rail--wide">
          {recentProducts.map((p) => <ProductPoster key={p.id} p={p} wide />)}
        </Rail>
      )}
      <Rail title="New on Zenkaii" sub={`DROP 009 · ${products.length} RELICS`}>
        {products.map((p, i) => <ProductPoster key={p.id} p={p} rank={i < 10 ? i + 1 : undefined} />)}
      </Rail>
      {cats.map((cat) => {
        const list = products.filter((p) => p.cat === cat);
        if (list.length < 2) return null;
        return (
          <Rail key={cat} id={railId(cat)} title={titleCase(cat)} sub={CATEGORY_JP[cat]}>
            {list.map((p) => <ProductPoster key={p.id} p={p} />)}
          </Rail>
        );
      })}
    </div>
  );
}

export function ProductPoster({ p, wide = false, rank }: { p: Product; wide?: boolean; rank?: number }) {
  const { openPdp, add } = useStore();
  const art = useRef<HTMLButtonElement>(null);

  return (
    <article className={"zk-poster" + (wide ? " is-wide" : "")} role="listitem">
      <div className="zk-poster-frame">
        <button ref={art} className="zk-poster-art" onClick={() => openPdp(p)} aria-label={`View ${p.name}`}>
          <div className="zk-hatch" />
          <div className="zk-poster-glyph" aria-hidden>{p.glyph}</div>
          {p.image ? (
            <Image src={p.image.url} alt={p.image.alt} fill draggable={false} sizes={wide ? "320px" : "240px"} style={{ objectFit: "cover" }} />
          ) : (
            <img src="/zenkaii-mask.png" alt="" className="zk-poster-mask" draggable={false} />
          )}
          <div className="zk-poster-shade" />
          {p.tags[0] && <span className="zk-poster-tag">{p.tags[0]}</span>}
          {rank !== undefined && rank <= 3 && (
            <span className="zk-poster-rank">
              TOP<b>{rank}</b>
            </span>
          )}
          {!p.available && <span className="zk-poster-sold">SOLD OUT</span>}
          <span className="zk-poster-name">{p.name}</span>
        </button>
        {p.available && (
          <button className="zk-poster-add" aria-label={`Add ${p.name} to cart`} onClick={() => add(p, null, art.current)}>
            +
          </button>
        )}
      </div>
      <div className="zk-poster-meta">
        <span>{p.jp ? p.jp + " · " : ""}{p.cat}</span>
        <span className="zk-poster-price">{money(p.price, p.currency)}</span>
      </div>
    </article>
  );
}
