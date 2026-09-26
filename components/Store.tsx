"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { CONFIG, motionFor, type MotionLevel } from "@/lib/config";
import { flyToCart, tiltMove, tiltReset } from "@/lib/fx";
import { EMPTY_CART, type Cart, type CartLine, type Product } from "@/lib/types";

const CART_KEY = "zk_cart_id";
const PENDING_KEY = "zk_checkout_pending";

// 0 cart · 1 redirecting to Shopify checkout · 3 sealed (step 2, payment, happens on Shopify)
export type Step = 0 | 1 | 3;

type StoreCtx = {
  products: Product[];
  shopify: boolean;
  motion: ReturnType<typeof motionFor> & { level: MotionLevel; cursor: boolean; reduced: boolean };
  cart: Cart;
  count: number;
  add: (p: Product, size: string | null, origin?: HTMLElement | null) => void;
  setQty: (line: CartLine, qty: number) => void;
  drawer: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  step: Step;
  checkout: () => void;
  finish: () => void;
  orderNo: string | null;
  pdp: Product | null;
  openPdp: (p: Product) => void;
  closePdp: () => void;
  fav: Record<string, boolean>;
  toggleFav: (id: string) => void;
  toast: string | null;
  say: (msg: string, ms?: number) => void;
  tilt: { onMouseMove: (e: React.MouseEvent<HTMLElement>) => void; onMouseLeave: (e: React.MouseEvent<HTMLElement>) => void };
  refs: {
    cartBtn: React.RefObject<HTMLButtonElement | null>;
    badge: React.RefObject<HTMLSpanElement | null>;
    fx: React.RefObject<HTMLDivElement | null>;
  };
};

const Ctx = createContext<StoreCtx | null>(null);

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore outside <StoreProvider>");
  return c;
}

async function cartApi(body: Record<string, unknown>): Promise<Cart | null> {
  const res = await fetch("/api/cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Cart error");
  return json.cart;
}

export function StoreProvider({ products, shopify, children }: { products: Product[]; shopify: boolean; children: React.ReactNode }) {
  const [reduced, setReduced] = useState(false);
  const [cart, setCart] = useState<Cart>(EMPTY_CART);
  const [drawer, setDrawer] = useState(false);
  const [step, setStep] = useState<Step>(0);
  const [orderNo, setOrderNo] = useState<string | null>(null);
  const [pdp, setPdp] = useState<Product | null>(null);
  const [fav, setFav] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<string | null>(null);

  const cartBtn = useRef<HTMLButtonElement>(null);
  const badge = useRef<HTMLSpanElement>(null);
  const fx = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const serverCart = useRef<Cart>(EMPTY_CART);
  const queue = useRef<Promise<unknown>>(Promise.resolve());

  const say = useCallback((msg: string, ms = 2100) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), ms);
  }, []);

  // ---------- motion preferences ----------
  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const motion = useMemo(() => {
    const level: MotionLevel = reduced ? "Calm" : CONFIG.motionLevel;
    return { ...motionFor(level), level, reduced, cursor: CONFIG.cursorSpirit && !reduced };
  }, [reduced]);

  const tilt = useMemo(
    () => ({
      onMouseMove: (e: React.MouseEvent<HTMLElement>) => tiltMove(e.currentTarget, e.clientX, e.clientY, motion.tilt),
      onMouseLeave: (e: React.MouseEvent<HTMLElement>) => tiltReset(e.currentTarget),
    }),
    [motion.tilt]
  );

  // ---------- favourites persist per browser ----------
  useEffect(() => {
    try {
      const f = localStorage.getItem("zk_fav");
      if (f) setFav(JSON.parse(f));
    } catch {}
  }, []);
  const toggleFav = useCallback((id: string) => {
    setFav((s) => {
      const next = { ...s, [id]: !s[id] };
      try { localStorage.setItem("zk_fav", JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  // ---------- Shopify cart sync ----------
  const commit = useCallback((c: Cart | null) => {
    const next = c || EMPTY_CART;
    serverCart.current = next;
    setCart(next);
    try {
      if (next.id) localStorage.setItem(CART_KEY, next.id);
      else localStorage.removeItem(CART_KEY);
    } catch {}
  }, []);

  const run = useCallback(
    (fn: () => Promise<Cart | null | undefined>) => {
      queue.current = queue.current
        .then(fn)
        .then((c) => { if (c !== undefined) commit(c); })
        .catch((err) => {
          console.error(err);
          say("THE GATE REFUSED — TRY AGAIN", 2600);
          setCart(serverCart.current);
        });
      return queue.current;
    },
    [commit, say]
  );

  useEffect(() => {
    if (!shopify) return;
    let id: string | null = null;
    let pending: string | null = null;
    try {
      id = localStorage.getItem(CART_KEY);
      pending = localStorage.getItem(PENDING_KEY);
    } catch {}
    if (!id) return;
    fetch("/api/cart?id=" + encodeURIComponent(id))
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(({ cart: c }: { cart: Cart | null }) => {
        if (c) {
          commit(c);
          return;
        }
        // A cart that vanished after we sent the buyer to checkout has been completed.
        commit(null);
        try { localStorage.removeItem(PENDING_KEY); } catch {}
        if (pending === id) {
          setOrderNo(null);
          setStep(3);
          setDrawer(true);
          say("OATH SEALED", 2400);
        }
      })
      .catch(() => {});
  }, [shopify, commit, say]);

  // ---------- cart actions ----------
  const add = useCallback(
    (p: Product, size: string | null, origin?: HTMLElement | null) => {
      const variant = p.variants.find((v) => v.size === size) || p.variants.find((v) => v.available) || p.variants[0];
      if (!variant || !variant.available) {
        say("THIS RELIC HAS BEEN SEALED AWAY");
        return;
      }
      const optimistic = (c: Cart): Cart => {
        const i = c.lines.findIndex((l) => l.merchandiseId === variant.id);
        const lines =
          i >= 0
            ? c.lines.map((l, n) => (n === i ? { ...l, qty: l.qty + 1 } : l))
            : [...c.lines, { id: shopify ? "tmp:" + variant.id : variant.id, merchandiseId: variant.id, productId: p.id, handle: p.handle, name: p.name, size: variant.size, price: p.price, qty: 1, image: p.image }];
        return { ...c, currency: p.currency, lines, subtotal: lines.reduce((a, l) => a + l.price * l.qty, 0) };
      };
      setCart(optimistic);
      if (shopify) run(() => cartApi({ action: "add", cartId: serverCart.current.id, merchandiseId: variant.id }));
      flyToCart(origin || null, cartBtn.current, badge.current, fx.current);
      say(p.name.toUpperCase() + " — BOUND");
    },
    [shopify, run, say]
  );

  const setQty = useCallback(
    (line: CartLine, qty: number) => {
      setCart((c) => {
        const lines = qty <= 0 ? c.lines.filter((l) => l.merchandiseId !== line.merchandiseId) : c.lines.map((l) => (l.merchandiseId === line.merchandiseId ? { ...l, qty } : l));
        return { ...c, lines, subtotal: lines.reduce((a, l) => a + l.price * l.qty, 0) };
      });
      if (shopify)
        run(async () => {
          const cur = serverCart.current;
          const real = cur.lines.find((l) => l.merchandiseId === line.merchandiseId);
          if (!cur.id || !real) return undefined;
          return cartApi({ action: "update", cartId: cur.id, lineId: real.id, quantity: Math.max(0, qty) });
        });
    },
    [shopify, run]
  );

  const checkout = useCallback(() => {
    if (!cart.lines.length) return;
    if (!shopify) {
      // Demo mode: no store connected, so seal it locally like the prototype did.
      setOrderNo("ZK-" + Math.floor(100000 + Math.random() * 899999));
      setStep(3);
      setCart(EMPTY_CART);
      say("OATH SEALED", 2400);
      return;
    }
    setStep(1);
    queue.current.then(() => {
      const c = serverCart.current;
      if (!c.id || !c.checkoutUrl) {
        setStep(0);
        say("THE GATE REFUSED — TRY AGAIN", 2600);
        return;
      }
      try { localStorage.setItem(PENDING_KEY, c.id); } catch {}
      window.location.href = c.checkoutUrl;
    });
  }, [cart.lines.length, shopify, say]);

  // Returning via the back button from Shopify checkout restores the page from bfcache.
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => { if (e.persisted) setStep((s) => (s === 1 ? 0 : s)); };
    addEventListener("pageshow", onShow);
    return () => removeEventListener("pageshow", onShow);
  }, []);

  const openDrawer = useCallback(() => {
    setStep((s) => (s === 3 ? 0 : s));
    setDrawer(true);
  }, []);
  const closeDrawer = useCallback(() => setDrawer(false), []);
  const finish = useCallback(() => {
    setDrawer(false);
    setStep(0);
  }, []);

  const openPdp = useCallback((p: Product) => setPdp(p), []);
  const closePdp = useCallback(() => setPdp(null), []);

  // Lock page scroll under overlays; Escape closes the top one.
  useEffect(() => {
    const locked = drawer || !!pdp;
    document.documentElement.style.overflow = locked ? "hidden" : "";
    if (!locked) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (drawer) setDrawer(false);
      else setPdp(null);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [drawer, pdp]);

  const count = cart.lines.reduce((a, l) => a + l.qty, 0);

  const value: StoreCtx = {
    products, shopify, motion, cart, count, add, setQty,
    drawer, openDrawer, closeDrawer, step, checkout, finish, orderNo,
    pdp, openPdp, closePdp, fav, toggleFav, toast, say, tilt,
    refs: { cartBtn, badge, fx },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
