"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { money } from "@/lib/money";
import { collectionPath } from "@/lib/site";
import { useStore } from "./Store";

export default function ProductModal() {
  const { pdp: p, closePdp, add, fav, toggleFav, tilt, characters } = useStore();
  const [size, setSize] = useState<string | null>(null);
  const visual = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!p) return;
    const firstOpen = p.variants.filter((v) => v.available);
    // Prototype defaulted to the second size (usually M).
    setSize((firstOpen[Math.min(1, firstOpen.length - 1)] || p.variants[0])?.size ?? null);
    closeBtn.current?.focus();
  }, [p]);

  if (!p) return null;
  const specs = [
    { k: "CATEGORY", v: p.cat },
    ...(p.tags.length ? [{ k: "RUN", v: p.tags.join(" · ") }] : []),
    { k: "SHIPS", v: "2–4 NIGHTS FROM KYOTO" },
    { k: "RETURNS", v: "30 NIGHTS, UNWORN" },
  ];
  const sku = "ZK-" + (p.id.match(/\d+$/)?.[0] || "0").slice(-3).padStart(3, "0");

  return (
    <div className="zk-pdp-backdrop" onClick={closePdp}>
      <div className="zk-pdp" role="dialog" aria-modal="true" aria-label={p.name} onClick={(e) => e.stopPropagation()}>
        <button ref={closeBtn} className="zk-x zk-pdp-x" onClick={closePdp} aria-label="Close">✕</button>
        <div ref={visual} className="zk-pdp-visual zk-tilt" {...tilt}>
          <div className="zk-hatch" />
          <div data-depth="18" data-center className="zk-pdp-glyph" aria-hidden>{p.glyph}</div>
          <div className="zk-pdp-halo" />
          {p.image ? (
            <div data-depth="12" className="zk-photo">
              <Image src={p.image.url} alt={p.image.alt} fill sizes="(max-width: 800px) 100vw, 590px" style={{ objectFit: "cover" }} />
            </div>
          ) : (
            <div data-depth="36" data-center className="zk-pdp-mask">
              <img src="/zenkaii-mask.png" alt={p.name} className="zk-fill" />
            </div>
          )}
          <div className="zk-pdp-shot">{p.image ? "" : "[ PRODUCT SHOT — 1:1 ] · "}{p.jp}</div>
        </div>
        <div className="zk-pdp-info">
          <div className="zk-pdp-cat">{p.cat} · {sku}</div>
          <h2>{p.name}</h2>
          <div className="zk-pdp-price">{money(p.price, p.currency)}</div>
          <p>{p.blurb}</p>
          {p.sizes.length > 1 || p.sizes[0] !== "ONE" ? (
            <>
              <div className="zk-pdp-label">SIZE</div>
              <div className="zk-sizes" role="radiogroup" aria-label="Size">
                {p.variants.map((v) => (
                  <button
                    key={v.id}
                    role="radio"
                    aria-checked={size === v.size}
                    disabled={!v.available}
                    className={"zk-size" + (size === v.size ? " is-on" : "")}
                    onClick={() => setSize(v.size)}
                  >
                    {v.size}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="zk-pdp-label">SIZE</div>
              <div className="zk-sizes">
                <button className="zk-size is-on" aria-disabled>ONE</button>
              </div>
            </>
          )}
          <div className="zk-pdp-actions">
            <button className="zk-btn-seal" disabled={!p.available} onClick={() => add(p, size, visual.current)}>
              {p.available ? "SEAL THE CONTRACT" : "SEALED AWAY — SOLD OUT"}
            </button>
            <button className={"zk-pdp-fav" + (fav[p.id] ? " is-on" : "")} aria-pressed={!!fav[p.id]} aria-label="Favourite" onClick={() => toggleFav(p.id)}>✦</button>
          </div>
          {(() => {
            const from = characters.filter((c) => c.productIds.includes(p.id));
            return from.length ? (
              <div className="zk-pdp-chars">
                <span>FROM</span>
                {from.map((c) => (
                  <Link key={c.handle} href={collectionPath(c.handle)} style={{ "--hue": c.hue } as React.CSSProperties}>
                    {c.name}
                  </Link>
                ))}
              </div>
            ) : null;
          })()}
          <div className="zk-specs">
            {specs.map((s) => (
              <div key={s.k}>
                <span>{s.k}</span>
                <span>{s.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
