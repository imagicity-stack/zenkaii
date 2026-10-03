// Server-side Shopify Storefront API client. Never import this from a client component.
import { CHARACTER_ART, hueFor, MOCK_CHARACTERS } from "./characters";
import { MOCK_PRODUCTS } from "./mock";
import type { Cart, CartLine, Character, Product, ShopLinks } from "./types";

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN?.replace(/^https?:\/\//, "").replace(/\/$/, "");
const TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const API_VERSION = process.env.SHOPIFY_API_VERSION || "2026-07";
const COLLECTION = process.env.SHOPIFY_COLLECTION_HANDLE;

export const shopifyEnabled = Boolean(DOMAIN && TOKEN);

type GqlResponse<T> = { data?: T; errors?: { message: string }[] };

async function storefront<T>(query: string, variables: Record<string, unknown> = {}, revalidate?: number): Promise<T> {
  const res = await fetch(`https://${DOMAIN}/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": TOKEN! },
    body: JSON.stringify({ query, variables }),
    ...(revalidate === undefined ? { cache: "no-store" as const } : { next: { revalidate, tags: ["products"] } }),
  });
  if (!res.ok) throw new Error(`Shopify ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as GqlResponse<T>;
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join("; "));
  return json.data as T;
}

// ---------- products ----------

const PRODUCT_FIELDS = /* GraphQL */ `
  fragment ZkProduct on Product {
    id handle title description productType tags availableForSale
    priceRange { minVariantPrice { amount currencyCode } }
    featuredImage { url altText }
    options { name }
    variants(first: 50) { nodes { id title availableForSale selectedOptions { name value } } }
    jp: metafield(namespace: "custom", key: "jp_name") { value }
    glyph: metafield(namespace: "custom", key: "glyph") { value }
  }
`;

type ShopifyProduct = {
  id: string; handle: string; title: string; description: string; productType: string; tags: string[];
  availableForSale: boolean;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  featuredImage: { url: string; altText: string | null } | null;
  options: { name: string }[];
  variants: { nodes: { id: string; title: string; availableForSale: boolean; selectedOptions: { name: string; value: string }[] }[] };
  jp: { value: string } | null;
  glyph: { value: string } | null;
};

// Tags that drive behaviour rather than being shown as badges on the tile.
const HIDDEN_TAGS = new Set(["featured", "drop"]);

function sizeOptionName(p: ShopifyProduct) {
  const named = p.options.find((o) => /^(size|サイズ|format|dimensions?)$/i.test(o.name));
  return (named || p.options[0])?.name;
}

function mapProduct(p: ShopifyProduct): Product {
  const optName = sizeOptionName(p);
  const variants = p.variants.nodes.map((v) => {
    const opt = v.selectedOptions.find((o) => o.name === optName);
    const size = !opt || v.title === "Default Title" ? "ONE" : opt.value.toUpperCase();
    return { id: v.id, size, available: v.availableForSale };
  });
  const jp = p.jp?.value || "";
  return {
    id: p.id,
    handle: p.handle,
    name: p.title,
    jp,
    cat: (p.productType || "RELICS").toUpperCase(),
    price: parseFloat(p.priceRange.minVariantPrice.amount),
    currency: p.priceRange.minVariantPrice.currencyCode,
    glyph: p.glyph?.value || jp.charAt(0) || "狐",
    tags: p.tags.filter((t) => !HIDDEN_TAGS.has(t.toLowerCase())).slice(0, 2).map((t) => t.toUpperCase()),
    sizes: variants.map((v) => v.size),
    variants,
    blurb: p.description,
    image: p.featuredImage ? { url: p.featuredImage.url, alt: p.featuredImage.altText || p.title } : null,
    available: p.availableForSale,
    featured: p.tags.some((t) => t.toLowerCase() === "featured"),
  };
}

export async function getProducts(): Promise<Product[]> {
  if (!shopifyEnabled) return MOCK_PRODUCTS;
  try {
    if (COLLECTION) {
      const d = await storefront<{ collection: { products: { nodes: ShopifyProduct[] } } | null }>(
        `${PRODUCT_FIELDS} query($h: String!) { collection(handle: $h) { products(first: 100, sortKey: COLLECTION_DEFAULT) { nodes { ...ZkProduct } } } }`,
        { h: COLLECTION }, 60
      );
      if (d.collection) return d.collection.products.nodes.map(mapProduct);
    }
    const d = await storefront<{ products: { nodes: ShopifyProduct[] } }>(
      `${PRODUCT_FIELDS} query { products(first: 100, sortKey: BEST_SELLING) { nodes { ...ZkProduct } } }`,
      {}, 60
    );
    return d.products.nodes.map(mapProduct);
  } catch (err) {
    console.error("[zenkaii] Shopify product fetch failed, falling back to mock catalogue:", err);
    return MOCK_PRODUCTS;
  }
}

// ---------- character collections ----------
// Collections become carousel characters. Flag the ones to show with the boolean metafield
// custom.character = true (if none are flagged, every non-system collection is used).
// Optional metafields: custom.jp_name, custom.tagline, custom.genres ("A, B"), custom.badge,
// custom.ribbon, custom.year, custom.order (number, lowest first).

type ShopifyCollection = {
  id: string; handle: string; title: string; description: string;
  image: { url: string; altText: string | null } | null;
  character: { value: string } | null; jp: { value: string } | null; tagline: { value: string } | null;
  genres: { value: string } | null; badge: { value: string } | null; ribbon: { value: string } | null;
  year: { value: string } | null; order: { value: string } | null;
  products: { nodes: { id: string }[] };
};

const SYSTEM_COLLECTIONS = new Set(["all", "frontpage", "home-page"]);

function mapCollection(c: ShopifyCollection): Character {
  const art = CHARACTER_ART[c.handle];
  const jp = c.jp?.value || "";
  return {
    id: c.id,
    handle: c.handle,
    name: c.title,
    jp,
    tagline: c.tagline?.value || "",
    description: c.description,
    genres: (c.genres?.value || "").split(",").map((g) => g.trim()).filter(Boolean),
    year: c.year?.value || String(new Date().getFullYear()),
    badge: c.badge?.value || null,
    ribbon: c.ribbon?.value || null,
    image: art ? { url: art, alt: c.title } : c.image ? { url: c.image.url, alt: c.image.altText || c.title } : null,
    hue: hueFor(c.handle),
    glyph: jp.charAt(0) || c.title.charAt(0).toUpperCase(),
    productIds: c.products.nodes.map((n) => n.id),
  };
}

export async function getCharacters(): Promise<Character[]> {
  if (!shopifyEnabled) return MOCK_CHARACTERS;
  try {
    const mf = (k: string) => `${k}: metafield(namespace: "custom", key: "${k === "jp" ? "jp_name" : k}") { value }`;
    const d = await storefront<{ collections: { nodes: ShopifyCollection[] } }>(
      `query { collections(first: 100) { nodes {
        id handle title description image { url altText }
        ${["character", "jp", "tagline", "genres", "badge", "ribbon", "year", "order"].map(mf).join(" ")}
        products(first: 100) { nodes { id } }
      } } }`,
      {}, 60
    );
    const all = d.collections.nodes.filter((c) => !SYSTEM_COLLECTIONS.has(c.handle) && c.handle !== COLLECTION);
    const flagged = all.filter((c) => c.character?.value === "true");
    const order = (c: ShopifyCollection) => (c.order?.value && !isNaN(+c.order.value) ? +c.order.value : 1e9);
    return (flagged.length ? flagged : all).sort((a, b) => order(a) - order(b)).map(mapCollection);
  } catch (err) {
    console.error("[zenkaii] Shopify collections fetch failed:", err);
    return [];
  }
}

// ---------- cart ----------

const CART_FIELDS = /* GraphQL */ `
  fragment ZkCart on Cart {
    id checkoutUrl
    cost { subtotalAmount { amount currencyCode } }
    lines(first: 100) {
      nodes {
        id quantity
        merchandise {
          ... on ProductVariant {
            id title price { amount }
            image { url altText }
            product { id handle title featuredImage { url altText } }
          }
        }
      }
    }
  }
`;

type ShopifyCart = {
  id: string; checkoutUrl: string;
  cost: { subtotalAmount: { amount: string; currencyCode: string } };
  lines: { nodes: {
    id: string; quantity: number;
    merchandise: {
      id: string; title: string; price: { amount: string };
      image: { url: string; altText: string | null } | null;
      product: { id: string; handle: string; title: string; featuredImage: { url: string; altText: string | null } | null };
    };
  }[] };
};

function mapCart(c: ShopifyCart | null): Cart | null {
  if (!c) return null;
  const lines: CartLine[] = c.lines.nodes.map((l) => {
    const img = l.merchandise.image || l.merchandise.product.featuredImage;
    return {
      id: l.id,
      merchandiseId: l.merchandise.id,
      productId: l.merchandise.product.id,
      handle: l.merchandise.product.handle,
      name: l.merchandise.product.title,
      size: l.merchandise.title === "Default Title" ? "ONE" : l.merchandise.title.toUpperCase(),
      price: parseFloat(l.merchandise.price.amount),
      qty: l.quantity,
      image: img ? { url: img.url, alt: img.altText || l.merchandise.product.title } : null,
    };
  });
  return {
    id: c.id,
    checkoutUrl: c.checkoutUrl,
    lines,
    subtotal: parseFloat(c.cost.subtotalAmount.amount),
    currency: c.cost.subtotalAmount.currencyCode,
  };
}

type UserErrors = { userErrors: { message: string }[] };
function check<T extends UserErrors & { cart: ShopifyCart | null }>(r: T) {
  if (r.userErrors.length) throw new Error(r.userErrors.map((e) => e.message).join("; "));
  return mapCart(r.cart);
}

export async function getCart(cartId: string) {
  const d = await storefront<{ cart: ShopifyCart | null }>(`${CART_FIELDS} query($id: ID!) { cart(id: $id) { ...ZkCart } }`, { id: cartId });
  return mapCart(d.cart);
}

export async function addLine(cartId: string | null, merchandiseId: string, quantity = 1) {
  const lines = [{ merchandiseId, quantity }];
  if (!cartId) {
    const d = await storefront<{ cartCreate: UserErrors & { cart: ShopifyCart | null } }>(
      `${CART_FIELDS} mutation($lines: [CartLineInput!]) { cartCreate(input: { lines: $lines }) { cart { ...ZkCart } userErrors { message } } }`,
      { lines }
    );
    return check(d.cartCreate);
  }
  const d = await storefront<{ cartLinesAdd: UserErrors & { cart: ShopifyCart | null } }>(
    `${CART_FIELDS} mutation($id: ID!, $lines: [CartLineInput!]!) { cartLinesAdd(cartId: $id, lines: $lines) { cart { ...ZkCart } userErrors { message } } }`,
    { id: cartId, lines }
  );
  return check(d.cartLinesAdd);
}

export async function updateLine(cartId: string, lineId: string, quantity: number) {
  if (quantity <= 0) {
    const d = await storefront<{ cartLinesRemove: UserErrors & { cart: ShopifyCart | null } }>(
      `${CART_FIELDS} mutation($id: ID!, $ids: [ID!]!) { cartLinesRemove(cartId: $id, lineIds: $ids) { cart { ...ZkCart } userErrors { message } } }`,
      { id: cartId, ids: [lineId] }
    );
    return check(d.cartLinesRemove);
  }
  const d = await storefront<{ cartLinesUpdate: UserErrors & { cart: ShopifyCart | null } }>(
    `${CART_FIELDS} mutation($id: ID!, $lines: [CartLineUpdateInput!]!) { cartLinesUpdate(cartId: $id, lines: $lines) { cart { ...ZkCart } userErrors { message } } }`,
    { id: cartId, lines: [{ id: lineId, quantity }] }
  );
  return check(d.cartLinesUpdate);
}

// ---------- newsletter (Admin API) ----------

const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
export const newsletterEnabled = Boolean(DOMAIN && ADMIN_TOKEN);

export async function subscribeEmail(email: string) {
  const res = await fetch(`https://${DOMAIN}/admin/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": ADMIN_TOKEN! },
    body: JSON.stringify({
      query: `mutation($input: CustomerInput!) { customerCreate(input: $input) { customer { id } userErrors { field message } } }`,
      variables: {
        input: {
          email,
          tags: ["newsletter", "zenkaii-oath"],
          emailMarketingConsent: { marketingState: "SUBSCRIBED", marketingOptInLevel: "SINGLE_OPT_IN" },
        },
      },
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Shopify admin ${res.status}`);
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors.map((e: { message: string }) => e.message).join("; "));
  const errs: { field: string[] | null; message: string }[] = json.data.customerCreate.userErrors;
  // An existing customer is fine — they already took the oath.
  const real = errs.filter((e) => !/taken/i.test(e.message));
  if (real.length) throw new Error(real.map((e) => e.message).join("; "));
}

// ---------- shop links for the footer ----------

export async function getShopLinks(): Promise<ShopLinks> {
  if (!shopifyEnabled) return {};
  try {
    const d = await storefront<{ shop: { shippingPolicy: { url: string } | null; refundPolicy: { url: string } | null } }>(
      `query { shop { shippingPolicy { url } refundPolicy { url } } }`,
      {}, 3600
    );
    return {
      shipping: d.shop.shippingPolicy?.url || d.shop.refundPolicy?.url,
      // Redirects to the store's customer account login / order history.
      account: `https://${DOMAIN}/account`,
    };
  } catch (err) {
    console.error("[zenkaii] Shopify shop links fetch failed:", err);
    return {};
  }
}
