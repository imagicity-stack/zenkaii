import { NextResponse } from "next/server";
import { addLine, getCart, shopifyEnabled, updateLine } from "@/lib/shopify";

export const dynamic = "force-dynamic";

const isCartId = (v: unknown): v is string => typeof v === "string" && v.startsWith("gid://shopify/Cart/");
const isGid = (v: unknown): v is string => typeof v === "string" && v.startsWith("gid://shopify/");

function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(req: Request) {
  if (!shopifyEnabled) return fail("Shopify is not configured", 503);
  const id = new URL(req.url).searchParams.get("id");
  if (!isCartId(id)) return fail("Invalid cart id");
  try {
    return NextResponse.json({ cart: await getCart(id) });
  } catch (e) {
    console.error("[zenkaii] cart fetch", e);
    return fail("Could not load cart", 502);
  }
}

export async function POST(req: Request) {
  if (!shopifyEnabled) return fail("Shopify is not configured", 503);
  let body: { action?: string; cartId?: unknown; merchandiseId?: unknown; lineId?: unknown; quantity?: unknown };
  try {
    body = await req.json();
  } catch {
    return fail("Invalid JSON");
  }
  const cartId = body.cartId == null ? null : body.cartId;
  if (cartId !== null && !isCartId(cartId)) return fail("Invalid cart id");

  try {
    if (body.action === "add") {
      if (!isGid(body.merchandiseId)) return fail("Invalid variant");
      return NextResponse.json({ cart: await addLine(cartId, body.merchandiseId) });
    }
    if (body.action === "update") {
      const qty = Number(body.quantity);
      if (!cartId || !isGid(body.lineId) || !Number.isInteger(qty) || qty < 0 || qty > 99) return fail("Invalid update");
      return NextResponse.json({ cart: await updateLine(cartId, body.lineId, qty) });
    }
    return fail("Unknown action");
  } catch (e) {
    console.error("[zenkaii] cart mutation", e);
    return fail(e instanceof Error ? e.message : "Cart error", 502);
  }
}
