export const NAV_LINKS = [
  { label: "FOR YOU", to: "foryou" },
  { label: "DROP", to: "drop" },
  { label: "SHOP", to: "shop" },
  { label: "LOOKBOOK", to: "lookbook" },
  { label: "LORE", to: "lore" },
  { label: "WEARERS", to: "community" },
];

export const tickerItems = (freeOver: string) => [
  "DROP 009 LIVE", "ドロップ 009", "FREE CARRIAGE OVER " + freeOver, "HAND-NUMBERED", "九尾", "ONE STRIKE ONLY",
  "SHIPS FROM KYOTO", "誓約", "NO RESTOCKS", "面を被れ", "MEMBERS SEE IT FIRST", "全開",
];

export const LOOKBOOK = [
  { no: "01", title: "Dusk at the Gate", meta: "KURAMA · 35MM", ratio: "3/4", p: 0.08 },
  { no: "02", title: "Nine Lanterns", meta: "NIGHT TWO · FLASH", ratio: "1/1", p: -0.06 },
  { no: "03", title: "Ash & Cotton", meta: "STUDIO · 6X7", ratio: "3/4", p: 0.1 },
  { no: "04", title: "The Mask Stays On", meta: "CLOSING FRAME", ratio: "1/1", p: -0.09 },
];

export const OATHS = [
  { n: "一", title: "Strike once, never again", body: "Every silhouette is produced in a single run against a fixed count. When the last piece leaves the shrine, the screens are destroyed and the pattern is filed away. There are no restocks, no second colourways, no quiet reissues two seasons later." },
  { n: "二", title: "Name the hands", body: "Each garment carries the workshop and the person who finished it. The masks are painted by one artisan in Gifu; the chain-stitching is done on a 1950s machine in Okayama. If we cannot name the hands, we do not sell the object." },
  { n: "三", title: "The mask is a promise, not a costume", body: "We build the fox as protection, not a punchline. Nothing in the line mocks the folklore it borrows from, and a tenth of every drop goes back to the shrine restoration fund in Kyoto that let us photograph on their grounds." },
  { n: "四", title: "Say the number out loud", body: "Counts, materials, weights, and the country every component came from are printed on the card in the box. If a fabric changed mid-run, the card says so. You should never have to guess what you are wearing." },
];

export const UGC = [
  { handle: "@yurei.fits", likes: "2.4K", ratio: "3/4" }, { handle: "@kitsune_sam", likes: "981", ratio: "1/1" },
  { handle: "@akane.dev", likes: "1.7K", ratio: "1/1" }, { handle: "@nightmarket", likes: "643", ratio: "3/4" },
  { handle: "@hollowmask", likes: "3.1K", ratio: "1/1" }, { handle: "@inari.rider", likes: "512", ratio: "3/4" },
  { handle: "@sumi.core", likes: "2.9K", ratio: "1/1" }, { handle: "@nine.tails", likes: "1.2K", ratio: "1/1" },
  { handle: "@obon.club", likes: "760", ratio: "3/4" }, { handle: "@zk.archive", likes: "4.6K", ratio: "1/1" },
];

export const CONTACT_EMAIL = "hello@zenkaii.jp";

// section = scroll to a home-page section (optionally pre-filtering the shop by category);
// shop = a Shopify-hosted page resolved at request time; href = plain link.
export type FooterLink = { label: string; section?: string; cat?: string; shop?: "shipping" | "account"; href?: string };

export const FOOTER_COLS: { head: string; links: FooterLink[] }[] = [
  {
    head: "SHOP",
    links: [
      { label: "All relics", section: "shop", cat: "ALL" },
      { label: "Drop 009", section: "drop" },
      { label: "Masks", section: "shop", cat: "MASKS" },
      { label: "Figures", section: "shop", cat: "FIGURES" },
    ],
  },
  {
    head: "SHRINE",
    links: [
      { label: "Characters", section: "foryou" },
      { label: "The nine oaths", section: "lore" },
      { label: "Lookbook", section: "lookbook" },
      { label: "Wearers", section: "community" },
      { label: "Take the oath", section: "join" },
    ],
  },
  {
    head: "CONTACT",
    links: [
      { label: "Shipping & returns", shop: "shipping" },
      { label: "Track an oath", shop: "account" },
      { label: "Wholesale", href: `mailto:${CONTACT_EMAIL}?subject=Wholesale` },
      { label: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
    ],
  },
];
