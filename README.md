# ZENKAII — spirit-forged merch storefront

Headless storefront for **Zenkaii**, built from the Claude Design prototype in [`project/Zenkaii.dc.html`](project/Zenkaii.dc.html).

- **Frontend:** Next.js 16 (App Router, TypeScript), deployed on **Vercel**
- **Backend:** **Shopify** Storefront API (catalogue + cart) → Shopify hosted checkout (shipping + payment)
- **No store yet?** With no Shopify env vars set, the site runs on the prototype's 12-piece mock catalogue and a demo checkout, so a fresh Vercel deploy is fully clickable.

The original design handoff (prototype, chat transcripts, assets, and its [README](project/HANDOFF.md)) lives untouched in `project/` and `chats/`.

## What's implemented

Every section and motion moment from the prototype:

| Section | Motion |
| --- | --- |
| Hero with blinking kitsune mask + glint sweep | Cursor-tracking mask spirit (lagged, skews with velocity) |
| Crimson ticker | Marquee that reverses direction when you scroll up and speeds up with scroll velocity |
| Drop 009 feature + live countdown | 3D tilt tiles with parallax depth layers |
| Torii gate chapter breaks (×2) | Gates scale up as you scroll through them |
| Shop: category filters + sort, 12 relics | Ink-wipe + rise reveals on scroll |
| Product detail modal (sizes, specs, favourite) | Glitch / CRT scanlines on tile hover |
| Lookbook, Nine Oaths lore, UGC wall | Manga speed-lines driven by scroll velocity |
| Newsletter + footer | Petal + ember canvas field |
| Cart drawer (qty, remove, totals, free-carriage) | Product arcs into the cart with a spark trail, badge pops |

The prototype's **Tweaks panel** became env vars (see below). `prefers-reduced-motion` switches to *Calm*, hides the cursor spirit, and skips reveals.

### Checkout: what changed from the prototype

Shopify doesn't let a headless site take card details, so the drawer's SHIP → RITE steps now happen on **Shopify's hosted checkout**:

1. The drawer keeps the cart step (quantities, remove, subtotal, free-carriage message).
2. **SEAL — PROCEED TO CHECKOUT** lights up the SHIP/RITE bars and redirects to the Shopify cart's `checkoutUrl`.
3. When the buyer comes back after paying, the site sees the cart is gone and opens the drawer on **OATH SEALED**.

Tax and shipping are calculated by Shopify at checkout, so the drawer shows "AT CHECKOUT" for tribute.

### URLs

The storefront is still one scrolling page, but the address bar stays clean:

| URL | What you see |
| --- | --- |
| `/` | The whole site. Nav, hero and footer links scroll smoothly to their section without adding a `#hash`. |
| `/products/<handle>` | The same page with that product's modal open. Opening a tile pushes this URL, and browser back/close returns to `/` at the same scroll position. The link is shareable and has its own title, description, share image, canonical URL and `Product` structured data (price, currency, stock). |
| `/#shop`, `/#lore`, … | Old-style links still work: they scroll to the section, then the hash is removed. |
| `/sitemap.xml`, `/robots.txt` | Home plus every product page, for search engines. |

Home and product pages share one persistent layout (`app/(store)/layout.tsx`), so moving between them never reloads the page or empties the cart. Unknown product handles return a 404 and fall back to the home page.

Footer links point at real destinations: sections, category shortcuts (hidden if the live catalogue lacks that category), Shopify's shipping policy and customer account pages when a store is connected, and email otherwise.

## Local development

```bash
npm install
cp .env.example .env.local   # optional — leave blank for mock mode
npm run dev                  # http://localhost:3000
```

`npm run build` builds for production and `npm run typecheck` runs the TypeScript checks.

## Environment variables

| Var | Required | Purpose |
| --- | --- | --- |
| `SHOPIFY_STORE_DOMAIN` | for live store | e.g. `zenkaii.myshopify.com` |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | for live store | Storefront API **public** access token |
| `SHOPIFY_COLLECTION_HANDLE` | no | Only list this collection, in its manual order (= "FEATURED" sort) |
| `SHOPIFY_API_VERSION` | no | Default `2026-07` |
| `SHOPIFY_ADMIN_ACCESS_TOKEN` | no | Admin API token (`write_customers`) so newsletter sign-ups become subscribed customers. Without it sign-ups are only logged. |
| `NEXT_PUBLIC_MOTION_LEVEL` | no | `Full chaos` (default) · `Maximal` · `Calm` |
| `NEXT_PUBLIC_CURSOR_SPIRIT` | no | `false` to disable the mask cursor |
| `NEXT_PUBLIC_PETAL_DENSITY` | no | 0–80, default 34 |
| `NEXT_PUBLIC_FREE_CARRIAGE_OVER` | no | Display threshold, default 200. **Also set a matching free-shipping rate in Shopify.** |
| `NEXT_PUBLIC_DROP_NUMBER` / `_ENDS_AT` / `_RUN_SIZE` / `_REMAINING` | no | Featured drop copy + countdown target (ISO date; blank = rolling 13-day timer) |
| `NEXT_PUBLIC_SITE_URL` | no | Canonical URL for OG images (Vercel's production URL is used automatically) |

## Shopify setup

1. **Storefront token:** in Shopify admin, install the **Headless** sales channel (or create a custom app), create a storefront, and copy the *public access token*. Enable the product, cart and checkout scopes.
2. **Publish products** to that Headless channel.
3. **Map products to the design:**

   | Design field | Shopify source |
   | --- | --- |
   | Name, blurb, price, photo | Title, description, lowest variant price, featured image |
   | Category filter (TEES, OUTERWEAR…) | **Product type** |
   | Size buttons | Variant option named `Size` (falls back to the first option; single-variant products show `ONE`) |
   | Red badges on tiles | First two **tags** |
   | Drop 009 feature block | Tag a product **`featured`** |
   | Japanese name (`霊帷フーディ`) | Metafield `custom.jp_name` (single-line text) |
   | Background glyph (`霊`) | Metafield `custom.glyph` (single-line text, falls back to the first character of the JP name) |

   Products without a photo keep the prototype's hatched placeholder with the mask watermark.
4. **Newsletter (optional):** create a custom app with the `write_customers` Admin scope and set `SHOPIFY_ADMIN_ACCESS_TOKEN`.
5. **Return from checkout:** in *Settings → Checkout*, point the order-status "Continue shopping" link at your Vercel domain so buyers land back on the SEALED screen.

The catalogue is cached for 60 seconds (ISR), so product edits show up within a minute.

## Deploy to Vercel

1. Push this repo to GitHub and **Import** it in Vercel. The framework (Next.js) is detected automatically, so no build settings need changing.
2. Add the env vars above under *Project → Settings → Environment Variables*. Leave the Shopify vars blank to launch in mock mode.
3. Deploy. `/api/cart` and `/api/newsletter` run as serverless functions, so Shopify tokens never reach the browser.

## Project structure

```
app/
  layout.tsx            fonts (Cinzel, Zen Kaku Gothic New, Space Mono), base metadata
  (store)/layout.tsx    fetches products (Shopify or mock) → <Zenkaii>, persists across routes
  (store)/page.tsx      home (empty — the layout is the page)
  (store)/products/[handle]/page.tsx   per-product metadata + JSON-LD; the modal opens from the URL
  sitemap.ts, robots.ts
  globals.css           all styling + keyframes, ported from the prototype
  api/cart/route.ts     cart create/add/update/get → Storefront API
  api/newsletter/...    newsletter → Admin API customerCreate
components/
  Store.tsx             client state: cart sync, drawer, URL-driven product modal, sections, toast, favourites, motion prefs
  SectionLink.tsx       hash-free smooth-scroll links
  Effects.tsx           rAF loop: cursor spirit, petals, speed lines, marquee, parallax, gates, reveals
  Header, Hero, Ticker, FeaturedDrop, Gate, Shop, Editorial (lookbook/lore/UGC), Newsletter, Footer
  ProductModal.tsx, CartDrawer.tsx, Toast.tsx
lib/
  shopify.ts            Storefront + Admin GraphQL client (server only)
  mock.ts               prototype catalogue
  config.ts             env-driven tweaks
  fx.ts                 tilt + fly-to-cart animations
  content.ts            editorial copy, nav + footer links
  site.ts               site URL, product paths, titles
```
