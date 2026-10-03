"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { money } from "@/lib/money";
import { collectionPath } from "@/lib/site";
import { CharacterPlaceholder } from "./ForYou";
import { SearchIcon } from "./Header";
import { useStore } from "./Store";

const norm = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default function SearchOverlay() {
  const { search } = useStore();
  return search ? <SearchPanel /> : null;
}

function SearchPanel() {
  const { products, characters, closeSearch, openPdp } = useStore();
  const [q, setQ] = useState("");

  const { chars, items } = useMemo(() => {
    const n = norm(q.trim());
    if (!n) return { chars: characters, items: products.slice(0, 8) };
    const hit = (...fields: string[]) => fields.some((f) => norm(f).includes(n));
    return {
      chars: characters.filter((c) => hit(c.name, c.jp, c.tagline, ...c.genres)),
      items: products.filter((p) => hit(p.name, p.jp, p.cat, ...p.tags)),
    };
  }, [q, products, characters]);

  return (
    <div className="zk-search" role="dialog" aria-modal="true" aria-label="Search">
      <div className="zk-search-bar">
        <SearchIcon />
        <input
          autoFocus
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search relics, characters…"
          aria-label="Search relics and characters"
        />
        <button className="zk-x" onClick={closeSearch} aria-label="Close search">✕</button>
      </div>

      <div className="zk-search-body">
        {chars.length > 0 && (
          <>
            <div className="zk-search-label">{q ? "CHARACTERS" : "BROWSE CHARACTERS"}</div>
            <div className="zk-search-chars">
              {chars.map((c) => (
                <Link key={c.handle} href={collectionPath(c.handle)} onClick={closeSearch} className="zk-search-char" style={{ "--hue": c.hue } as React.CSSProperties}>
                  <div className="zk-search-char-art">
                    {c.image ? <Image src={c.image.url} alt="" fill sizes="96px" style={{ objectFit: "cover" }} /> : <CharacterPlaceholder c={c} />}
                  </div>
                  <span>{c.name}</span>
                </Link>
              ))}
            </div>
          </>
        )}

        <div className="zk-search-label">{q ? `RELICS · ${items.length}` : "POPULAR RELICS"}</div>
        {items.length === 0 ? (
          <div className="zk-search-empty">NOTHING ANSWERS TO “{q.toUpperCase()}”</div>
        ) : (
          <div className="zk-search-items">
            {items.map((p) => (
              <button key={p.id} className="zk-search-item" onClick={() => openPdp(p)}>
                <span className="zk-search-thumb">
                  {p.image ? <Image src={p.image.url} alt="" fill sizes="56px" style={{ objectFit: "cover" }} /> : <img src="/zenkaii-mask.png" alt="" />}
                </span>
                <span className="zk-search-item-text">
                  <span>{p.name}</span>
                  <span>{p.jp ? p.jp + " · " : ""}{p.cat}</span>
                </span>
                <span className="zk-price">{money(p.price, p.currency)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
