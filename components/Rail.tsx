"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Horizontal scroller behaviour shared by the character carousel and product rows:
// arrow paging, mouse drag-to-scroll (touch/trackpad scroll natively), and edge state
// for hiding arrows / fading the ends.
export function useRail() {
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const measure = useCallback(() => {
    const t = track.current;
    if (!t) return;
    const start = t.scrollLeft <= 4;
    const end = t.scrollLeft + t.clientWidth >= t.scrollWidth - 4;
    setEdges((e) => (e.start === start && e.end === end ? e : { start, end }));
  }, []);

  useEffect(() => {
    const t = track.current;
    if (!t) return;
    measure();
    t.addEventListener("scroll", measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(t);
    return () => {
      t.removeEventListener("scroll", measure);
      ro.disconnect();
    };
  }, [measure]);

  // Mouse drag-to-scroll. A drag past 6px swallows the click that ends it.
  useEffect(() => {
    const t = track.current;
    if (!t) return;
    let down = false, moved = false, x0 = 0, s0 = 0;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      down = true; moved = false; x0 = e.clientX; s0 = t.scrollLeft;
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - x0;
      if (!moved && Math.abs(dx) > 6) {
        moved = true;
        t.classList.add("is-dragging");
      }
      if (moved) t.scrollLeft = s0 - dx;
    };
    const onUp = () => {
      if (!down) return;
      down = false;
      if (!moved) return;
      t.classList.remove("is-dragging");
      const swallow = (ev: MouseEvent) => { ev.preventDefault(); ev.stopPropagation(); };
      t.addEventListener("click", swallow, { capture: true, once: true });
      setTimeout(() => t.removeEventListener("click", swallow, { capture: true }), 0);
    };
    t.addEventListener("pointerdown", onDown);
    addEventListener("pointermove", onMove);
    addEventListener("pointerup", onUp);
    return () => {
      t.removeEventListener("pointerdown", onDown);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerup", onUp);
    };
  }, []);

  const page = useCallback((dir: 1 | -1) => {
    const t = track.current;
    if (t) t.scrollBy({ left: dir * t.clientWidth * 0.85, behavior: "smooth" });
  }, []);

  return { track, edges, prev: () => page(-1), next: () => page(1) };
}

export function RailArrows({ edges, prev, next, label }: { edges: { start: boolean; end: boolean }; prev: () => void; next: () => void; label: string }) {
  return (
    <div className="zk-rail-arrows">
      <button onClick={prev} disabled={edges.start} aria-label={`Scroll ${label} left`}>‹</button>
      <button onClick={next} disabled={edges.end} aria-label={`Scroll ${label} right`}>›</button>
    </div>
  );
}

export default function Rail({
  id,
  title,
  sub,
  className = "",
  children,
}: {
  id?: string;
  title: string;
  sub?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { track, edges, prev, next } = useRail();
  return (
    <section id={id} className={"zk-rail " + className} data-reveal aria-label={title}>
      <div className="zk-rail-head">
        <h2>
          {title}
          {sub && <span>{sub}</span>}
        </h2>
        <RailArrows edges={edges} prev={prev} next={next} label={title} />
      </div>
      <div className={"zk-rail-viewport" + (edges.start ? " at-start" : "") + (edges.end ? " at-end" : "")}>
        <div ref={track} className="zk-rail-track" role="list">
          {children}
        </div>
      </div>
    </section>
  );
}
