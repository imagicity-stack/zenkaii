import type { Product } from "./types";

// The prototype's catalogue. Used whenever Shopify env vars are missing so the
// site renders fully on a fresh Vercel deploy.
const RAW = [
  { id: "p1", name: "Kitsune Oath Tee", jp: "狐誓Tシャツ", cat: "TEES", price: 58, glyph: "狐", tags: ["DROP 009"], sizes: ["S","M","L","XL","XXL"], blurb: "240gsm Japanese-spun cotton, garment-dyed in three baths so the black never reads flat. The oath runs down the left ribcage in raised plastisol." },
  { id: "p2", name: "Spirit Veil Hoodie", jp: "霊帷フーディ", cat: "OUTERWEAR", price: 148, glyph: "霊", tags: ["DROP 009","300 MADE"], sizes: ["S","M","L","XL"], blurb: "620gsm loopback dyed in iron-oxide and ash. Eleven screen passes, hand-scorched hem, and a hood deep enough to lose a face in.", featured: true },
  { id: "p3", name: "Nine-Tail Mask", jp: "九尾面", cat: "MASKS", price: 96, glyph: "面", tags: ["HAND-PAINTED"], sizes: ["ONE"], blurb: "Cast resin, sanded through six grits, then painted in bone lacquer and blood-red urushi by a single hand in Gifu. Elastic is silk." },
  { id: "p4", name: "Yokai Sentinel 1/7", jp: "妖怪衛士像", cat: "FIGURES", price: 320, glyph: "像", tags: ["1/7 SCALE"], sizes: ["ONE"], blurb: "One-seventh scale, 28cm to the ear tips. Hand-finished PVC with translucent tail-flame and a pinned base you can reposition twice." },
  { id: "p5", name: "Ember Gate Print", jp: "焔門版画", cat: "PRINTS", price: 42, glyph: "門", tags: ["A2"], sizes: ["A3","A2","A1"], blurb: "Five-colour risograph on 210gsm Takeo, printed in a Kyoto basement. The red is a spot fluorescent that will not photograph correctly." },
  { id: "p6", name: "Shrine Bell Pin Set", jp: "鈴章", cat: "PINS", price: 28, glyph: "鈴", tags: ["SET OF 3"], sizes: ["ONE"], blurb: "Three hard-enamel pins on antiqued brass: bell, tail, and gate. Double-posted so they never spin off your strap." },
  { id: "p7", name: "Inkflow Desk Mat", jp: "墨流机敷", cat: "DESK", price: 54, glyph: "墨", tags: ["900×400"], sizes: ["900×400","1200×600"], blurb: "Stitched-edge cloth over 4mm natural rubber. The sumi-e fox runs corner to corner and the weave is fast enough for a low-DPI sensor." },
  { id: "p8", name: "Zenkaii Codex Vol.1", jp: "全開典 壱", cat: "BOOKS", price: 46, glyph: "書", tags: ["208 PAGES"], sizes: ["ONE"], blurb: "208 pages, smyth-sewn, exposed red spine. Every drop from 001 to 009 with the rejected masks that never left the kiln." },
  { id: "p9", name: "Ronin Sling Bag", jp: "浪人肩掛", cat: "BAGS", price: 112, glyph: "鞄", tags: ["8L"], sizes: ["ONE"], blurb: "8 litres of X-Pac sailcloth with a magnetic Fidlock jaw. Sits flat on the back, swings to the front in one motion." },
  { id: "p10", name: "Crimson Fang Tee", jp: "紅牙Tシャツ", cat: "TEES", price: 58, glyph: "牙", tags: ["RESTOCK"], sizes: ["S","M","L","XL","XXL"], blurb: "Boxy 240gsm body with a dropped shoulder. The fang is discharge-printed so it sits inside the fabric instead of on top of it." },
  { id: "p11", name: "Ashfall Coach Jacket", jp: "灰降上衣", cat: "OUTERWEAR", price: 186, glyph: "灰", tags: ["120 MADE"], sizes: ["S","M","L","XL"], blurb: "Waxed 10oz cotton canvas, snap front, storm cuffs. The back panel is chain-stitched by a 1950s Singer in Okayama — four hours per jacket." },
  { id: "p12", name: "Foxfire Keychain", jp: "狐火鍵環", cat: "PINS", price: 18, glyph: "火", tags: ["GLOWS"], sizes: ["ONE"], blurb: "Cast brass tail on a split ring, with a strontium-aluminate core that holds a green charge for six hours after lights out." },
];

export const MOCK_PRODUCTS: Product[] = RAW.map((p) => ({
  ...p,
  handle: p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
  currency: "USD",
  variants: p.sizes.map((s) => ({ id: p.id + "/" + s, size: s, available: true })),
  image: null,
  available: true,
  featured: !!(p as { featured?: boolean }).featured,
}));

// Category order from the prototype; Shopify product types not listed here are appended.
export const CATEGORY_ORDER = ["TEES", "OUTERWEAR", "MASKS", "FIGURES", "PRINTS", "PINS", "DESK", "BOOKS", "BAGS"];
