"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { CONFIG, motionFor, type MotionLevel } from "@/lib/config";
import { flyToCart, tiltMove, tiltReset } from "@/lib/fx";
import { collectionTitle, HOME_TITLE, productPath, productTitle } from "@/lib/site";
import { EMPTY_CART, type Cart, type CartLine, type Character, type Product } from "@/lib/types";

const CART_KEY = "zk_cart_id";
const PENDING_KEY = "zk_checkout_pending";
const RECENT_MAX = 12;

function loadJson<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function saveJson(key: string, v: unknown) {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
}

// 0 cart · 1 redirecting to Shopify checkout · 3 sealed (step 2, payment, happens on Shopify)
export type Step = 0 | 1 | 3;

type StoreCtx = {
  products: Product[];
  characters: Character[];
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
  cat: string;
  setCat: (c: string) => void;
  goTo: (section: string, cat?: string) => void;
  fav: Record<string, boolean>;
  toggleFav: (id: string) => void;
  followed: Record<string, boolean>;
  toggleFollow: (c: Character) => void;
  recent: string[];
  search: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  toast: string | null;
  say: (msg: string, ms?: number) => void;
  tilt: { onMouseMove: (e: React.MouseEvent<HTMLElement>) => void; onMouseLeave: (e: React.MouseEvent<HTMLElement>) => void };
  refs: {
    cartBtn: React.RefObject<HTMLButtonElement | null>;
    badge: React.RefObject<HTMLSpanElement | null>;
    // The mobile tab bar has its own cart button; fly-to-cart aims at whichever is visible.
    cartBtnMobile: React.RefObject<HTMLButtonElement | null>;
    badgeMobile: React.RefObject<HTMLSpanElement | null>;
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

export function StoreProvider({
  products,
  characters,
  shopify,
  children,
}: {
  products: Product[];
  characters: Character[];
  shopify: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [reduced, setReduced] = useState(false);
  const [cart, setCart] = useState<Cart>(EMPTY_CART);
  const [drawer, setDrawer] = useState(false);
  const [step, setStep] = useState<Step>(0);
  const [orderNo, setOrderNo] = useState<string | null>(null);
  const [cat, setCat] = useState("ALL");
  const [fav, setFav] = useState<Record<string, boolean>>({});
  const [followed, setFollowed] = useState<Record<string, boolean>>({});
  const [recent, setRecent] = useState<string[]>([]);
  const [search, setSearch] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const cartBtn = useRef<HTMLButtonElement>(null);
  const badge = useRef<HTMLSpanElement>(null);
  const cartBtnMobile = useRef<HTMLButtonElement>(null);
  const badgeMobile = useRef<HTMLSpanElement>(null);
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

  // ---------- favourites, followed characters, recently viewed (per browser) ----------
  useEffect(() => {
    setFav(loadJson("zk_fav", {}));
    setFollowed(loadJson("zk_follow", {}));
    setRecent(loadJson<string[]>("zk_recent", []));
  }, []);
  const toggleFav = useCallback((id: string) => {
    setFav((s) => {
      const next = { ...s, [id]: !s[id] };
      saveJson("zk_fav", next);
      return next;
    });
  }, []);
  const toggleFollow = useCallback(
    (c: Character) => {
      const on = !followed[c.handle];
      const next = { ...followed, [c.handle]: on };
      setFollowed(next);
      saveJson("zk_follow", next);
      say((on ? "FOLLOWING " : "UNFOLLOWED ") + c.name.toUpperCase(), 1800);
    },
    [followed, say]
  );

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
      const mobile = !!cartBtnMobile.current?.getClientRects().length;
      flyToCart(origin || null, mobile ? cartBtnMobile.current : cartBtn.current, mobile ? badgeMobile.current : badge.current, fx.current);
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
    setSearch(false);
    setStep((s) => (s === 3 ? 0 : s));
    setDrawer(true);
  }, []);
  const closeDrawer = useCallback(() => setDrawer(false), []);
  const finish = useCallback(() => {
    setDrawer(false);
    setStep(0);
  }, []);

  // ---------- product URLs ----------
  // The modal is driven by the URL: /products/<handle> opens it, / closes it. Both routes share
  // one persistent layout, so history.pushState swaps the URL without a reload or refetch.
  const pathname = usePathname();
  const handle = productHandle(pathname);
  const pdp = useMemo(() => (handle ? products.find((p) => p.handle === handle) || null : null), [handle, products]);
  const pushedPdp = useRef(false);

  useEffect(() => {
    if (!handle) pushedPdp.current = false;
    // Unknown or retired handle: fall back to the home page rather than leaving a dead path.
    else if (!pdp) router.replace("/");
  }, [handle, pdp, router]);

  // pushState doesn't run Next's metadata, so keep the tab title in step with the modal.
  useEffect(() => {
    if (pdp) document.title = productTitle(pdp.name);
    else if (pathname === "/") document.title = HOME_TITLE;
    else {
      const c = characters.find((x) => pathname === "/collections/" + encodeURIComponent(x.handle));
      if (c) document.title = collectionTitle(c.name);
    }
  }, [pdp, pathname, characters]);

  // Remember what was opened for the "Pick up the trail" row.
  useEffect(() => {
    if (!pdp) return;
    setRecent((r) => {
      const next = [pdp.id, ...r.filter((id) => id !== pdp.id)].slice(0, RECENT_MAX);
      saveJson("zk_recent", next);
      return next;
    });
  }, [pdp]);

  const openPdp = useCallback((p: Product) => {
    setSearch(false);
    const url = productPath(p.handle);
    if (productHandle(location.pathname)) history.replaceState(null, "", url);
    else {
      history.pushState(null, "", url);
      pushedPdp.current = true;
    }
  }, []);

  const closePdp = useCallback(() => {
    if (pushedPdp.current) {
      pushedPdp.current = false;
      history.back();
    } else history.replaceState(null, "", "/");
  }, []);

  // ---------- in-page sections (smooth scroll, no #hash in the address bar) ----------
  const goTo = useCallback(
    (section: string, nextCat?: string) => {
      if (nextCat) setCat(products.some((p) => p.cat === nextCat) ? nextCat : "ALL");
      setSearch(false);
      const el = section === "top" ? null : document.getElementById(section);
      const onHome = location.pathname === "/" || !!productHandle(location.pathname);
      // Sections live on the home page; from a character page, navigate home first.
      if (!onHome || (section !== "top" && !el)) {
        router.push(section === "top" ? "/" : "/#" + section);
        return;
      }
      if (location.hash || location.pathname !== "/") history.replaceState(null, "", "/");
      if (section === "top") scrollTo({ top: 0 });
      else el?.scrollIntoView();
    },
    [products, router]
  );

  // Old /#section links (bookmarks, new tabs, typed hashes) still land on the section,
  // then the hash is dropped.
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const clean = () => {
      if (!location.hash) return;
      clearTimeout(t);
      // The browser / router already scroll to the anchor; once they have written their own
      // history entry, just drop the hash from the address bar.
      t = setTimeout(() => {
        if (location.hash) history.replaceState(null, "", location.pathname);
      }, 160);
    };
    clean();
    addEventListener("hashchange", clean);
    return () => {
      clearTimeout(t);
      removeEventListener("hashchange", clean);
    };
  }, [pathname]);

  const openSearch = useCallback(() => setSearch(true), []);
  const closeSearch = useCallback(() => setSearch(false), []);

  // Lock page scroll under overlays; Escape closes the top one.
  useEffect(() => {
    const locked = drawer || !!pdp || search;
    document.documentElement.style.overflow = locked ? "hidden" : "";
    if (!locked) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (drawer) setDrawer(false);
      else if (pdp) closePdp();
      else setSearch(false);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [drawer, pdp, search, closePdp]);

  const count = cart.lines.reduce((a, l) => a + l.qty, 0);

  const value: StoreCtx = {
    products, characters, shopify, motion, cart, count, add, setQty,
    drawer, openDrawer, closeDrawer, step, checkout, finish, orderNo,
    pdp, openPdp, closePdp, cat, setCat, goTo, fav, toggleFav, followed, toggleFollow, recent,
    search, openSearch, closeSearch, toast, say, tilt,
    refs: { cartBtn, badge, cartBtnMobile, badgeMobile, fx },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function productHandle(pathname: string | null) {
  const m = pathname?.match(/^\/products\/([^/]+)\/?$/);
  if (!m) return null;
  try {
    return decodeURIComponent(m[1]);
  } catch {
    return m[1];
  }
}
