"use client";

import { useState } from "react";
import { useStore } from "./Store";

export default function Newsletter() {
  const { say } = useStore();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state !== "idle") return;
    if (!email.includes("@")) {
      say("A REAL ADDRESS, PLEASE", 1800);
      return;
    }
    setState("busy");
    try {
      const res = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setState("done");
      say("YOU SEE DROP 010 FIRST", 2200);
    } catch (err) {
      setState("idle");
      say(err instanceof Error && err.message ? err.message.toUpperCase() : "THE SHRINE IS CLOSED — TRY AGAIN", 2200);
    }
  };

  return (
    <section data-screen-label="Newsletter" id="join" className="zk-join">
      <div className="zk-join-stripes" />
      <div data-parallax="0.18" className="zk-join-mask" aria-hidden>
        <img src="/zenkaii-mask.png" alt="" className="zk-fill" />
      </div>
      <div data-reveal className="zk-join-inner">
        <div className="zk-join-eyebrow">DROP 010 SEALS IN 14 DAYS</div>
        <h2>TAKE THE<br />OATH FIRST</h2>
        <p>Members see every drop 24 hours early and get the numbered card. No noise, nine emails a year, one per tail.</p>
        <form className="zk-join-form" onSubmit={subscribe}>
          <input
            type="email"
            aria-label="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@shrine.jp"
            disabled={state === "done"}
          />
          <button type="submit" disabled={state !== "idle"}>
            {state === "done" ? "OATH TAKEN ✦" : state === "busy" ? "SEALING…" : "TAKE THE OATH"}
          </button>
        </form>
      </div>
    </section>
  );
}
