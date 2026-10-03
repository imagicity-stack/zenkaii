import type { Character } from "./types";

// ---------------------------------------------------------------------------
// Character poster art lives in /public/characters/<handle>.<ext> (portrait, 3:4).
// Add an entry here when an image is uploaded; it overrides the Shopify collection
// image for that handle, and the placeholder poster for the mock catalogue.
// ---------------------------------------------------------------------------
export const CHARACTER_ART: Record<string, string> = {
  // kitsune: "/characters/kitsune.jpg",
};

type Seed = Omit<Character, "id" | "image" | "productIds" | "year"> & { products: string[] };

// Placeholder characters for mock mode, mapped onto the mock catalogue (product ids p1–p12).
const SEEDS: Seed[] = [
  { handle: "kitsune", name: "Kitsune", jp: "狐", glyph: "狐", hue: 352, tagline: "The nine-tailed oath", genres: ["Yōkai", "Trickster"], badge: "TOP 10", ribbon: "DROP 009 LIVE", products: ["p1", "p3", "p12", "p8"],
    description: "The fox who took a mask in exchange for a winter. Every Zenkaii drop begins and ends with her mark." },
  { handle: "yurei", name: "Yūrei", jp: "幽霊", glyph: "霊", hue: 268, tagline: "The veiled ghost", genres: ["Spirit", "Tragedy"], badge: "NEW", ribbon: null, products: ["p2", "p11"],
    description: "A spirit that never finished its business. Heavy loopback, ash dyes and hoods deep enough to vanish in." },
  { handle: "oni", name: "Oni", jp: "鬼", glyph: "鬼", hue: 8, tagline: "Crimson fang", genres: ["Demon", "Action"], badge: null, ribbon: "NEW DROP WEEKLY", products: ["p10", "p9"],
    description: "Horned, loud and impossible to ignore. Discharge-printed fangs and gear built to take a hit." },
  { handle: "tengu", name: "Tengu", jp: "天狗", glyph: "天", hue: 28, tagline: "The mountain watcher", genres: ["Guardian", "Folklore"], badge: null, ribbon: null, products: ["p4", "p5"],
    description: "Long-nosed sentinel of the high passes. Resin figures and risograph prints from the ridge line." },
  { handle: "ronin", name: "Rōnin", jp: "浪人", glyph: "浪", hue: 212, tagline: "The masterless", genres: ["Samurai", "Drama"], badge: "TOP 10", ribbon: null, products: ["p9", "p11"],
    description: "No lord, no banner, one bag. Sailcloth and waxed canvas for walking the long road." },
  { handle: "raijin", name: "Raijin", jp: "雷神", glyph: "雷", hue: 48, tagline: "Drum of the storm", genres: ["Deity", "Action"], badge: null, ribbon: "NEW DROP WEEKLY", products: ["p7", "p6"],
    description: "The thunder god beats his drums across the desk. Mats, pins and anything that crackles." },
  { handle: "kappa", name: "Kappa", jp: "河童", glyph: "河", hue: 158, tagline: "The river trickster", genres: ["Yōkai", "Comedy"], badge: null, ribbon: null, products: ["p6", "p12"],
    description: "Polite, cucumber-obsessed and dangerous near water. Small relics for straps and keys." },
  { handle: "yuki-onna", name: "Yuki-onna", jp: "雪女", glyph: "雪", hue: 196, tagline: "The snow bride", genres: ["Spirit", "Romance"], badge: "NEW", ribbon: null, products: ["p5", "p8"],
    description: "She appears in blizzards and leaves no footprints. Pale prints and the archive codex." },
];

export const MOCK_CHARACTERS: Character[] = SEEDS.map(({ products, ...s }) => ({
  ...s,
  id: "c-" + s.handle,
  year: "2026",
  image: CHARACTER_ART[s.handle] ? { url: CHARACTER_ART[s.handle], alt: s.name } : null,
  productIds: products,
}));

// Deterministic placeholder hue for Shopify collections that have no art yet.
export function hueFor(handle: string) {
  let h = 0;
  for (const ch of handle) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return h;
}
