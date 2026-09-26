"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { CONFIG } from "@/lib/config";
import { money } from "@/lib/money";
import { useStore } from "./Store";

const FALLBACK_MS = ((13 * 24 + 7) * 60 + 42) * 60_000 + 18_000;

function useCountdown() {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const parsed = Date.parse(CONFIG.drop.endsAt);
    const end = isNaN(parsed) ? Date.now() + FALLBACK_MS : parsed;
    const tick = () => setLeft(Math.max(0, end - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  const s = Math.floor((left ?? FALLBACK_MS) / 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return [
    { v: p(Math.floor(s / 86400)), k: "DAYS" },
    { v: p(Math.floor(s / 3600) % 24), k: "HRS" },
    { v: p(Math.floor(s / 60) % 60), k: "MIN" },
    { v: p(s % 60), k: "SEC" },
  ];
}

export default function FeaturedDrop() {
  const { products, add, tilt } = useStore();
  const visual = useRef<HTMLDivElement>(null);
  const countdown = useCountdown();
  const p = products.find((x) => x.featured) || products[1] || products[0];
  if (!p) return null;

  const words = p.name.toUpperCase().split(" ");
  const last = words.length > 1 ? words.pop() : "";
  const size = p.sizes.includes("L") ? "L" : null;

  return (
    <section data-screen-label="Featured drop" id="drop" className="zk-drop">
      <div data-parallax="0.2" className="zk-drop-glyph" aria-hidden>狐</div>
      <div className="zk-drop-grid">
        <div data-reveal data-wipe>
          <div className="zk-drop-eyebrow">
            <span />DROP {CONFIG.drop.number} — LIVE NOW
          </div>
          <h2 className="zk-drop-title">
            {words.join(" ")}
            {last && <><br />{last}</>}
          </h2>
          <p className="zk-drop-body">{p.blurb}</p>
          <div className="zk-countdown" aria-label="Drop closes in">
            {countdown.map((c) => (
              <div key={c.k}>
                <span className="zk-countdown-v" suppressHydrationWarning>{c.v}</span>
                <span className="zk-countdown-k">{c.k}</span>
              </div>
            ))}
          </div>
          <div className="zk-drop-buy">
            <button className="zk-btn-crimson" disabled={!p.available} onClick={() => add(p, size, visual.current)}>
              {p.available ? `CLAIM — ${money(p.price, p.currency)}` : "SEALED AWAY"}
            </button>
            <div className="zk-drop-left">
              {CONFIG.drop.remaining} / {CONFIG.drop.runSize} REMAIN
            </div>
          </div>
        </div>

        <div data-reveal className="zk-drop-visualwrap">
          <div className="zk-drop-ring1" aria-hidden />
          <div className="zk-drop-ring2" aria-hidden />
          <div ref={visual} className="zk-drop-visual zk-tilt" {...tilt}>
            <div className="zk-hatch" />
            {p.image ? (
              <div data-depth="12" className="zk-photo">
                <Image src={p.image.url} alt={p.image.alt} fill sizes="(max-width: 800px) 100vw, 50vw" style={{ objectFit: "cover" }} priority />
              </div>
            ) : (
              <div data-depth="26" data-center className="zk-drop-mask">
                <img src="/zenkaii-mask.png" alt="" className="zk-fill" />
              </div>
            )}
            <div data-depth="-14" className="zk-drop-caption">
              <div>
                {p.image ? "" : "[ PRODUCT SHOT — 4:5 ]"}
                {!p.image && <br />}DROP {CONFIG.drop.number} / {p.name.toUpperCase()}
              </div>
              <div className="zk-drop-no">{CONFIG.drop.number}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
