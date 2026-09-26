"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { CONFIG } from "@/lib/config";
import { money } from "@/lib/money";
import { useStore } from "./Store";

const STEP_LABELS = ["CART", "SHIP", "RITE", "DONE"];

export default function CartDrawer() {
  const { drawer, closeDrawer, cart, count, setQty, step, checkout, finish, orderNo, shopify } = useStore();
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (drawer) closeBtn.current?.focus();
  }, [drawer]);

  if (!drawer) return null;

  const cur = cart.currency;
  const sub = cart.subtotal;
  const freeOver = CONFIG.freeCarriageOver;
  const empty = cart.lines.length === 0;

  const meta = {
    0: { t: "YOUR CONTRACTS", s: count + " ITEM" + (count === 1 ? "" : "S") + " HELD", cta: count ? "SEAL — PROCEED TO CHECKOUT" : "CART IS EMPTY" },
    1: { t: "OPENING THE GATE", s: "TAKING YOU TO SECURE CHECKOUT", cta: "OPENING…" },
    3: { t: "SEALED", s: "THE FOX HAS YOUR WORD", cta: "CLOSE THE GATE" },
  }[step];

  const disabled = (step === 0 && !count) || step === 1;

  const totals =
    step === 3
      ? [{ k: "STATUS", v: "PAID", cls: "is-paid" }]
      : [
          { k: "SUBTOTAL", v: money(sub, cur), cls: "" },
          { k: "TRIBUTE (TAX)", v: "AT CHECKOUT", cls: "" },
          {
            k: "CARRIAGE",
            v: sub >= freeOver && sub > 0 ? "FREE — OATH BONUS" : sub > 0 ? money(freeOver - sub, cur) + " TO FREE" : "—",
            cls: "",
          },
          { k: "TOTAL", v: money(sub, cur), cls: "is-total" },
        ];

  // Visual steps: SHIP + RITE light up while handing off, all four once sealed.
  const lit = step === 3 ? 3 : step === 1 ? 2 : 0;

  return (
    <div className="zk-drawer-root">
      <div className="zk-drawer-scrim" onClick={closeDrawer} />
      <aside className="zk-drawer" role="dialog" aria-modal="true" aria-label="Cart">
        <div className="zk-drawer-head">
          <div>
            <div className="zk-drawer-title">{meta.t}</div>
            <div className="zk-drawer-sub">{meta.s}</div>
          </div>
          <button ref={closeBtn} className="zk-x" onClick={closeDrawer} aria-label="Close cart">✕</button>
        </div>

        <div className="zk-steps" aria-hidden>
          {STEP_LABELS.map((label, i) => (
            <div key={label} className={i <= lit ? "is-on" : ""}>
              <div className="zk-step-bar" />
              <div className="zk-step-label">{label}</div>
            </div>
          ))}
        </div>

        <div className="zk-drawer-body">
          {step !== 3 && (
            <>
              {empty && (
                <div className="zk-cart-empty">
                  <div className="zk-cart-empty-mask">
                    <img src="/zenkaii-mask.png" alt="" className="zk-fill" />
                  </div>
                  <div className="zk-cart-empty-t">NO CONTRACTS YET</div>
                  <div className="zk-cart-empty-s">THE FOX IS WAITING</div>
                </div>
              )}
              <div className="zk-lines">
                {cart.lines.map((l) => (
                  <div key={l.merchandiseId} className="zk-line">
                    <div className="zk-line-thumb">
                      {l.image ? (
                        <Image src={l.image.url} alt={l.image.alt} fill sizes="78px" style={{ objectFit: "cover" }} />
                      ) : (
                        <div className="zk-line-mask">
                          <img src="/zenkaii-mask.png" alt="" className="zk-fill" />
                        </div>
                      )}
                    </div>
                    <div className="zk-line-info">
                      <div className="zk-line-name">{l.name}</div>
                      <div className="zk-line-sku">{l.size}</div>
                      <div className="zk-qty">
                        <button onClick={() => setQty(l, l.qty - 1)} aria-label={`Decrease ${l.name}`} disabled={step === 1}>−</button>
                        <span aria-live="polite">{l.qty}</span>
                        <button onClick={() => setQty(l, l.qty + 1)} aria-label={`Increase ${l.name}`} disabled={step === 1}>+</button>
                      </div>
                    </div>
                    <div className="zk-line-right">
                      <div className="zk-line-price">{money(l.price * l.qty, cur)}</div>
                      <button className="zk-line-remove" onClick={() => setQty(l, 0)} disabled={step === 1}>REMOVE</button>
                    </div>
                  </div>
                ))}
              </div>
              {!empty && (
                <div className="zk-rite-note">
                  <div>THE RITE OF PAYMENT</div>
                  <p>
                    {shopify
                      ? "Shipping and payment are sealed on our secure checkout. Your contracts stay held here if you turn back."
                      : "Demo mode — no Shopify store is connected, so nothing is charged. The fox keeps no ledger."}
                  </p>
                </div>
              )}
            </>
          )}

          {step === 3 && (
            <div className="zk-sealed">
              <div className="zk-sealed-emblem">
                <div className="zk-sealed-ring" />
                <div className="zk-sealed-ring zk-sealed-ring2" />
                <div className="zk-sealed-mask">
                  <img src="/zenkaii-mask.png" alt="" className="zk-fill" />
                </div>
              </div>
              <div className="zk-sealed-t">OATH SEALED</div>
              <div className="zk-sealed-no">{orderNo ? "ORDER " + orderNo : "CONFIRMATION SENT TO YOUR EMAIL"}</div>
              <p>Your numbered card is being struck. Watch for a message from the shrine within three nights.</p>
            </div>
          )}
        </div>

        <div className="zk-drawer-foot">
          {totals.map((t) => (
            <div key={t.k} className={"zk-total " + t.cls}>
              <span>{t.k}</span>
              <span>{t.v}</span>
            </div>
          ))}
          <button className="zk-cta" disabled={disabled} onClick={step === 3 ? finish : checkout}>
            {meta.cta}
          </button>
        </div>
      </aside>
    </div>
  );
}
