"use client";

import { useEffect, useRef } from "react";
import { CONFIG } from "@/lib/config";
import { useStore } from "./Store";

type Petal = { x: number; y: number; r: number; s: number; a: number; sp: number; ember: boolean; o: number };

export default function Effects() {
  const { motion, refs } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const speedRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mouse = { x: innerWidth / 2, y: innerHeight / 2 };
    const cur = { ...mouse };
    let lastY = scrollY, vel = 0, mx = 0, dir = -1, raf = 0;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (cursorRef.current) cursorRef.current.style.opacity = "0.9";
    };
    addEventListener("pointermove", onMove, { passive: true });

    // ---- parallax + torii gates ----
    const pxEls = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
    const gateEls = Array.from(document.querySelectorAll<HTMLElement>("[data-gatescale]"));
    const parallax = () => {
      const vh = innerHeight;
      for (const el of pxEls) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -400 || r.top > vh + 400) continue;
        const sp = (parseFloat(el.dataset.parallax || "0") || 0) * motion.k;
        const mid = r.top + r.height / 2 - vh / 2;
        const base = el.hasAttribute("data-center") ? "translate(-50%,-50%) " : "";
        el.style.transform = base + "translate3d(0," + (-mid * sp).toFixed(1) + "px,0)";
      }
      for (const el of gateEls) {
        const r = el.parentElement!.getBoundingClientRect();
        const t = 1 - (r.top + r.height / 2) / (vh + r.height / 2);
        const k = Math.max(0, Math.min(1.6, t * 1.7));
        el.style.transform = "scale(" + (0.55 + k * 0.85).toFixed(3) + ") translateZ(0)";
        el.style.opacity = String(Math.max(0, Math.min(1, 1.25 - Math.abs(t - 0.55) * 1.5)));
      }
    };

    const onScroll = () => {
      const y = scrollY;
      const d = y - lastY;
      lastY = y;
      vel = vel * 0.6 + d * 0.4;
      if (Math.abs(d) > 0.5) dir = d > 0 ? -1 : 1;
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      if (progressRef.current) progressRef.current.style.width = Math.min(100, (y / max) * 100) + "%";
      parallax();
    };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll, { passive: true });

    // ---- reveal + ink-wipe ----
    const fold = innerHeight - 60;
    const hidden: HTMLElement[] = [];
    for (const el of Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"))) {
      if (motion.reduced || el.getBoundingClientRect().top <= fold) continue;
      el.style.opacity = "0";
      el.style.transform = "translateY(46px)";
      if (el.hasAttribute("data-wipe")) el.style.clipPath = "inset(0 100% 0 0)";
      el.style.transition = "opacity .85s cubic-bezier(.16,1,.3,1), transform .95s cubic-bezier(.16,1,.3,1), clip-path 1.1s cubic-bezier(.16,1,.3,1)";
      hidden.push(el);
    }
    const show = (el: HTMLElement) => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
      el.style.clipPath = "inset(0 0 0 0)";
      // Hand the element back to its stylesheet so tilt/hover transitions stay snappy.
      setTimeout(() => {
        el.style.transition = "";
        el.style.transform = "";
        el.style.clipPath = "";
      }, 1200);
    };
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          const i = hidden.indexOf(el);
          setTimeout(() => show(el), (i % 4) * 90);
          io.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
    );
    hidden.forEach((el) => io.observe(el));

    // ---- petals + embers ----
    const c = canvasRef.current!;
    const ctx = c.getContext("2d")!;
    const dpr = Math.min(2, devicePixelRatio || 1);
    const size = () => {
      c.width = innerWidth * dpr;
      c.height = innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    addEventListener("resize", size, { passive: true });
    const N = Math.round(CONFIG.petalDensity * motion.k);
    const parts: Petal[] = Array.from({ length: N }, (_, i) => ({
      x: Math.random() * innerWidth, y: Math.random() * innerHeight,
      r: 2 + Math.random() * 5, s: 0.25 + Math.random() * 0.75,
      a: Math.random() * 6.28, sp: (Math.random() - 0.5) * 0.03,
      ember: i % 3 === 0, o: 0.25 + Math.random() * 0.5,
    }));

    let marquee: HTMLElement | null = null;

    const tick = () => {
      // cursor spirit lag
      const cr = cursorRef.current;
      if (cr) {
        cur.x += (mouse.x - cur.x) * 0.085;
        cur.y += (mouse.y - cur.y) * 0.085;
        const dx = mouse.x - cur.x, dy = mouse.y - cur.y;
        const sk = Math.max(-14, Math.min(14, dx * 0.16));
        cr.style.transform = "translate3d(" + cur.x.toFixed(1) + "px," + cur.y.toFixed(1) + "px,0) rotate(" + sk.toFixed(2) + "deg) scale(" + (1 + Math.min(0.22, Math.hypot(dx, dy) / 900)).toFixed(3) + ")";
      }
      // speed lines from scroll velocity
      vel *= 0.9;
      const sp = speedRef.current;
      if (sp) {
        const v = Math.min(1, Math.abs(vel) / 46);
        sp.style.opacity = (v * motion.lines).toFixed(3);
        sp.style.transform = "scale(" + (1 + v * 0.22).toFixed(3) + ") rotate(" + (vel * 0.05).toFixed(2) + "deg)";
      }
      // marquee — direction flips with scroll; wraps on the duplicate strip's first child
      if (!marquee || !marquee.isConnected) marquee = document.querySelector<HTMLElement>("[data-marquee]");
      if (marquee) {
        mx += dir * (0.6 + Math.min(2.6, Math.abs(vel) * 0.06)) * (motion.reduced ? 0.4 : 1);
        const kids = marquee.children;
        const half = kids.length >> 1;
        const w = (kids[half] as HTMLElement | undefined)?.offsetLeft || marquee.scrollWidth / 2 || 1200;
        if (mx < -w) mx += w;
        if (mx > 0) mx -= w;
        marquee.style.transform = "translate3d(" + mx.toFixed(1) + "px,0,0)";
      }
      // petals + embers
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      for (const p of parts) {
        p.a += p.sp;
        if (p.ember) {
          p.y -= p.s * 0.9;
          p.x += Math.sin(p.a) * 0.5;
          if (p.y < -12) { p.y = innerHeight + 12; p.x = Math.random() * innerWidth; }
          ctx.globalAlpha = p.o * 0.85;
          ctx.fillStyle = "#E8324A";
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 0.42, 0, 6.2832);
          ctx.fill();
        } else {
          p.y += p.s * 1.15;
          p.x += Math.sin(p.a) * 0.85;
          if (p.y > innerHeight + 16) { p.y = -16; p.x = Math.random() * innerWidth; }
          ctx.globalAlpha = p.o * 0.6;
          ctx.fillStyle = "#F2EDE4";
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.a);
          ctx.beginPath();
          ctx.ellipse(0, 0, p.r, p.r * 0.46, 0, 0, 6.2832);
          ctx.fill();
          ctx.restore();
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    onScroll();

    return () => {
      removeEventListener("pointermove", onMove);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      removeEventListener("resize", size);
      cancelAnimationFrame(raf);
      io.disconnect();
      hidden.forEach(show);
    };
  }, [motion]);

  return (
    <>
      <canvas ref={canvasRef} className="zk-petals" aria-hidden />
      <div ref={speedRef} className="zk-speed" aria-hidden />
      <div className="zk-scanlines" aria-hidden />
      <div className="zk-topfade" aria-hidden />
      {motion.cursor && (
        <div ref={cursorRef} className="zk-cursor" aria-hidden>
          <div className="zk-cursor-glow" />
          <img src="/zenkaii-mask.png" alt="" className="zk-fill" />
        </div>
      )}
      <div ref={refs.fx} className="zk-fx" aria-hidden />
      <div className="zk-progress">
        <div ref={progressRef} />
      </div>
    </>
  );
}
