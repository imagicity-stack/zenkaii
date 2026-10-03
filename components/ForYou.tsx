"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { collectionPath } from "@/lib/site";
import type { Character } from "@/lib/types";
import { RailArrows, useRail } from "./Rail";
import { useStore } from "./Store";

const MOBILE = "(max-width: 760px)";
const AUTOPLAY_MS = 5200;

// "For You": the character-collection carousel at the top of the home page.
// Mobile: one big card at a time, centre-snapped, neighbours peeking and scaled down, auto-advancing.
// Desktop: a long rail of portrait posters with arrows and drag-to-scroll.
export default function ForYou() {
  const { characters } = useStore();
  const { track, edges, prev, next } = useRail();
  const [active, setActive] = useState(0);

  // Mobile: scale/dim cards by distance from centre, track the active card, auto-advance.
  useEffect(() => {
    const t = track.current;
    if (!t) return;
    const mq = matchMedia(MOBILE);
    let raf = 0;
    let lastTouch = 0;
    let visible = true;

    const cards = () => Array.from(t.children) as HTMLElement[];
    const paint = () => {
      raf = 0;
      const els = cards();
      if (!mq.matches) {
        els.forEach((el) => el.style.removeProperty("--near"));
        return;
      }
      const mid = t.scrollLeft + t.clientWidth / 2;
      let best = 0, bestD = Infinity;
      els.forEach((el, i) => {
        const d = Math.abs(el.offsetLeft + el.offsetWidth / 2 - mid);
        if (d < bestD) { bestD = d; best = i; }
        el.style.setProperty("--near", Math.max(0, 1 - d / el.offsetWidth).toFixed(3));
      });
      setActive(best);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(paint); };
    const touched = () => { lastTouch = Date.now(); };

    t.addEventListener("scroll", onScroll, { passive: true });
    t.addEventListener("pointerdown", touched, { passive: true });
    t.addEventListener("touchstart", touched, { passive: true });
    mq.addEventListener("change", onScroll);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.4 });
    io.observe(t);
    paint();

    const timer = setInterval(() => {
      if (!mq.matches || !visible || document.hidden || Date.now() - lastTouch < AUTOPLAY_MS * 1.5) return;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const els = cards();
      if (els.length < 2) return;
      const mid = t.scrollLeft + t.clientWidth / 2;
      const cur = els.findIndex((el) => el.offsetLeft + el.offsetWidth > mid);
      const target = els[(cur + 1) % els.length];
      t.scrollTo({ left: target.offsetLeft - (t.clientWidth - target.offsetWidth) / 2, behavior: "smooth" });
    }, AUTOPLAY_MS);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(timer);
      io.disconnect();
      t.removeEventListener("scroll", onScroll);
      t.removeEventListener("pointerdown", touched);
      t.removeEventListener("touchstart", touched);
      mq.removeEventListener("change", onScroll);
    };
  }, [track, characters.length]);

  const goToCard = (i: number) => {
    const t = track.current;
    const el = t?.children[i] as HTMLElement | undefined;
    if (t && el) t.scrollTo({ left: el.offsetLeft - (t.clientWidth - el.offsetWidth) / 2, behavior: "smooth" });
  };

  if (!characters.length) return null;

  return (
    <section id="foryou" className="zk-foryou" aria-label="For You — character collections">
      <div className="zk-foryou-glow" aria-hidden />
      <div className="zk-foryou-head">
        <h2>
          For You
          <span>CHARACTER COLLECTIONS / キャラ</span>
        </h2>
        <RailArrows edges={edges} prev={prev} next={next} label="characters" />
      </div>
      <div className={"zk-rail-viewport zk-foryou-viewport" + (edges.start ? " at-start" : "") + (edges.end ? " at-end" : "")}>
        <div ref={track} className="zk-foryou-track" role="list">
          {characters.map((c, i) => (
            <CharacterCard key={c.handle} c={c} priority={i < 3} />
          ))}
        </div>
      </div>
      <div className="zk-foryou-dots" aria-hidden>
        {characters.map((c, i) => (
          <button key={c.handle} tabIndex={-1} className={i === active ? "is-on" : ""} onClick={() => goToCard(i)} />
        ))}
      </div>
    </section>
  );
}

export function CharacterCard({ c, priority = false, compact = false }: { c: Character; priority?: boolean; compact?: boolean }) {
  const { products, followed, toggleFollow } = useStore();
  const count = useMemo(() => products.filter((p) => c.productIds.includes(p.id)).length, [products, c.productIds]);
  const href = collectionPath(c.handle);
  const on = !!followed[c.handle];

  return (
    <article className={"zk-char" + (compact ? " is-compact" : "")} role="listitem" style={{ "--hue": c.hue } as React.CSSProperties}>
      <Link href={href} className="zk-char-link" aria-label={`${c.name} collection, ${count} relics`} draggable={false}>
        <div className="zk-char-art">
          {c.image ? (
            <Image src={c.image.url} alt={c.image.alt} fill priority={priority} draggable={false} sizes="(max-width: 760px) 80vw, 280px" style={{ objectFit: "cover" }} />
          ) : (
            <CharacterPlaceholder c={c} />
          )}
        </div>
        <div className="zk-char-shade" />
        <div className="zk-char-chip">
          <span>✦</span>
          {count} RELIC{count === 1 ? "" : "S"}
        </div>
        {c.badge && <div className="zk-char-badge">{c.badge}</div>}
        <div className="zk-char-info">
          <div className="zk-char-name">{c.name}</div>
          {(c.jp || c.tagline) && <div className="zk-char-tag">{[c.jp, c.tagline].filter(Boolean).join(" · ")}</div>}
          <div className="zk-char-meta">{[c.year, ...c.genres].join(" • ")}</div>
        </div>
        {c.ribbon && <div className="zk-char-ribbon">{c.ribbon}</div>}
      </Link>
      {!compact && (
        <div className="zk-char-actions">
          <button className={"zk-char-follow" + (on ? " is-on" : "")} aria-pressed={on} aria-label={on ? `Unfollow ${c.name}` : `Follow ${c.name}`} onClick={() => toggleFollow(c)}>
            {on ? "✓" : "+"}
          </button>
          <Link href={href} className="zk-char-play" aria-label={`Open ${c.name} collection`} draggable={false}>
            ▶
          </Link>
        </div>
      )}
    </article>
  );
}

// Until real art is uploaded: a coloured poster with the character's glyph and the fox mask.
export function CharacterPlaceholder({ c }: { c: Character }) {
  return (
    <div className="zk-char-ph">
      <div className="zk-char-ph-glyph" aria-hidden>{c.glyph}</div>
      <img src="/zenkaii-mask.png" alt="" className="zk-char-ph-mask" draggable={false} />
    </div>
  );
}
