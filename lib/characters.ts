import type { Character } from "./types";

// ---------------------------------------------------------------------------
// Character poster art lives in /public/characters/<handle>.<ext> (portrait, 3:4).
// Add an entry here when an image is uploaded; it overrides the Shopify collection
// image for that handle, and the placeholder poster for the mock catalogue.
// ---------------------------------------------------------------------------
export const CHARACTER_ART: Record<string, string> = {
  "gojo-satoru": "/characters/gojo-satoru.webp",
  "edward-elric": "/characters/edward-elric.webp",
  "ichigo-kurosaki": "/characters/ichigo-kurosaki.webp",
  "levi-ackerman": "/characters/levi-ackerman.webp",
  "l-lawliet": "/characters/l-lawliet.webp",
};

type Seed = Omit<Character, "id" | "image" | "productIds"> & { products: string[] };

// The character line-up for mock mode, mapped onto the mock catalogue (product ids p1–p12).
// With Shopify connected, collections replace these (see README → Character collections).
const SEEDS: Seed[] = [
  { handle: "gojo-satoru", name: "Gojo Satoru", jp: "五条悟", glyph: "無", hue: 272, year: "2020", tagline: "The strongest", genres: ["Jujutsu Kaisen", "Sorcerer"], badge: "TOP 10", ribbon: null, products: ["p2", "p11", "p7"],
    description: "Blindfold on, Infinity up. Heavyweight blacks and violet-shot prints for the honoured one." },
  { handle: "edward-elric", name: "Edward Elric", jp: "エドワード・エルリック", glyph: "鋼", hue: 214, year: "2009", tagline: "The Fullmetal Alchemist", genres: ["Fullmetal Alchemist", "Alchemy"], badge: null, ribbon: "NEW DROP WEEKLY", products: ["p11", "p6", "p8"],
    description: "Equivalent exchange, in cotton and brass. Red-coat outerwear and transmutation-circle relics." },
  { handle: "ichigo-kurosaki", name: "Ichigo Kurosaki", jp: "黒崎一護", glyph: "護", hue: 2, year: "2004", tagline: "Substitute Soul Reaper", genres: ["Bleach", "Shinigami"], badge: "TOP 10", ribbon: null, products: ["p10", "p9"],
    description: "Black shihakushō, crimson reiatsu. Tees and carry built for drawing a blade the size of a door." },
  { handle: "levi-ackerman", name: "Levi Ackerman", jp: "リヴァイ", glyph: "兵", hue: 140, year: "2013", tagline: "Humanity's strongest soldier", genres: ["Attack on Titan", "Survey Corps"], badge: "NEW", ribbon: null, products: ["p2", "p9"],
    description: "Wings of Freedom on the back, spotless everywhere else. Field jackets and gear for beyond the walls." },
  { handle: "l-lawliet", name: "L Lawliet", jp: "エル", glyph: "探", hue: 228, year: "2006", tagline: "The world's greatest detective", genres: ["Death Note", "Mystery"], badge: null, ribbon: null, products: ["p8", "p7", "p1"],
    description: "White long-sleeve, no socks, ninety-nine percent certainty. Quiet pieces for long nights on the case." },
  { handle: "naruto-uzumaki", name: "Naruto Uzumaki", jp: "うずまきナルト", glyph: "忍", hue: 30, year: "2002", tagline: "Host of the Nine-Tails", genres: ["Naruto", "Ninja"], badge: "TOP 10", ribbon: "DROP 009 LIVE", products: ["p1", "p3", "p12"],
    description: "The nine-tailed fox, sealed and grinning. Fox masks, foxfire keychains and the oath tee." },
  { handle: "monkey-d-luffy", name: "Monkey D. Luffy", jp: "モンキー・D・ルフィ", glyph: "海", hue: 6, year: "1999", tagline: "Future King of the Pirates", genres: ["One Piece", "Pirate"], badge: "TOP 10", ribbon: null, products: ["p10", "p9", "p5"],
    description: "Straw hat, red vest, no plan. Sea-ready bags and prints for crossing the Grand Line." },
  { handle: "tanjiro-kamado", name: "Tanjiro Kamado", jp: "竈門炭治郎", glyph: "炭", hue: 196, year: "2019", tagline: "Water Breathing", genres: ["Demon Slayer", "Swordsman"], badge: "NEW", ribbon: null, products: ["p5", "p4", "p7"],
    description: "Checkered haori and a blade that flows like water. Wave-print desk mats and figures." },
  { handle: "goku", name: "Goku", jp: "孫悟空", glyph: "悟", hue: 26, year: "1986", tagline: "The Saiyan raised on Earth", genres: ["Dragon Ball", "Martial arts"], badge: null, ribbon: "NEW DROP WEEKLY", products: ["p4", "p6", "p10"],
    description: "Orange gi, endless appetite, one more power level. Figures and pins for training-day fits." },
  { handle: "sailor-moon", name: "Sailor Moon", jp: "セーラームーン", glyph: "月", hue: 328, year: "1992", tagline: "Pretty guardian of the moon", genres: ["Sailor Moon", "Magical girl"], badge: "NEW", ribbon: null, products: ["p5", "p6", "p12"],
    description: "In the name of the moon. Crescent pins, moonlit prints and keychains that glow after dark." },
];

export const MOCK_CHARACTERS: Character[] = SEEDS.map(({ products, ...s }) => ({
  ...s,
  id: "c-" + s.handle,
  image: CHARACTER_ART[s.handle] ? { url: CHARACTER_ART[s.handle], alt: s.name } : null,
  productIds: products,
}));

// Deterministic placeholder hue for Shopify collections that have no art yet.
export function hueFor(handle: string) {
  let h = 0;
  for (const ch of handle) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return h;
}
