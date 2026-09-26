"use client";

import { NAV_LINKS } from "@/lib/content";
import SectionLink from "./SectionLink";
import { useStore } from "./Store";

export default function Header() {
  const { count, openDrawer, refs } = useStore();
  return (
    <header className="zk-header">
      <SectionLink to="top" className="zk-brand">
        <div className="zk-brand-mark">
          <img src="/zenkaii-mask.png" alt="Zenkaii" className="zk-fill" />
        </div>
        <div className="zk-brand-text">
          <span className="zk-brand-name">ZENKAII</span>
          <span className="zk-brand-sub">ゼンカイ / EST. 令和</span>
        </div>
      </SectionLink>

      <nav className="zk-nav" aria-label="Sections">
        {NAV_LINKS.map((l) => (
          <SectionLink key={l.to} to={l.to}>{l.label}</SectionLink>
        ))}
      </nav>

      <button ref={refs.cartBtn} onClick={openDrawer} className="zk-cartbtn" aria-label={`Cart, ${count} items`}>
        <span>CART</span>
        <span ref={refs.badge} className="zk-badge">{count}</span>
      </button>
    </header>
  );
}
