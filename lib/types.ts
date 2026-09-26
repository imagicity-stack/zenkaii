export type Variant = {
  id: string;
  size: string;
  available: boolean;
};

export type Product = {
  id: string;
  handle: string;
  name: string;
  jp: string;
  cat: string;
  price: number;
  currency: string;
  glyph: string;
  tags: string[];
  sizes: string[];
  variants: Variant[];
  blurb: string;
  image: { url: string; alt: string } | null;
  available: boolean;
  featured: boolean;
};

export type CartLine = {
  id: string;
  merchandiseId: string;
  productId: string;
  handle: string;
  name: string;
  size: string;
  price: number;
  qty: number;
  image: { url: string; alt: string } | null;
};

export type Cart = {
  id: string | null;
  checkoutUrl: string | null;
  lines: CartLine[];
  subtotal: number;
  currency: string;
};

export const EMPTY_CART: Cart = { id: null, checkoutUrl: null, lines: [], subtotal: 0, currency: "USD" };

// Shopify-hosted pages linked from the footer (empty when no store is connected).
export type ShopLinks = { shipping?: string; account?: string };
