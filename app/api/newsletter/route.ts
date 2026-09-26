import { NextResponse } from "next/server";
import { newsletterEnabled, subscribeEmail } from "@/lib/shopify";

export const dynamic = "force-dynamic";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let email = "";
  try {
    email = String((await req.json()).email || "").trim().toLowerCase();
  } catch {}
  if (!EMAIL.test(email) || email.length > 254) {
    return NextResponse.json({ error: "A real address, please" }, { status: 400 });
  }
  if (!newsletterEnabled) {
    console.warn("[zenkaii] SHOPIFY_ADMIN_ACCESS_TOKEN not set — newsletter signup not stored:", email);
    return NextResponse.json({ ok: true, demo: true });
  }
  try {
    await subscribeEmail(email);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[zenkaii] newsletter", e);
    return NextResponse.json({ error: "The shrine is closed — try again" }, { status: 502 });
  }
}
