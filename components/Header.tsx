"use client";

import { CONFIG } from "@/lib/config";
import { NAV_LINKS } from "@/lib/content";
import SectionLink from "./SectionLink";
import { useStore } from "./Store";

export default function Header() {
  const { count, openDrawer, openSearch, refs } = useStore();
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

      {/* Mobile: two channel pills under the logo, streaming-app style. */}
      <div className="zk-pills">
        <SectionLink to="foryou" className="zk-pill zk-pill-brand">
          <span aria-hidden>✶</span> Zenkaii
        </SectionLink>
        <SectionLink to="drop" className="zk-pill zk-pill-drop">
          <span aria-hidden>✶</span> DROP {CONFIG.drop.number}
        </SectionLink>
      </div>

      <nav className="zk-nav" aria-label="Sections">
        {NAV_LINKS.map((l) => (
          <SectionLink key={l.to} to={l.to}>{l.label}</SectionLink>
        ))}
      </nav>

      <div className="zk-header-actions">
        <button className="zk-iconbtn" onClick={openSearch} aria-label="Search">
          <SearchIcon />
        </button>
        <button ref={refs.cartBtn} onClick={openDrawer} className="zk-cartbtn" aria-label={`Cart, ${count} items`}>
          <span>CART</span>
          <span ref={refs.badge} className="zk-badge">{count}</span>
        </button>
      </div>
    </header>
  );
}

export function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  );
}

export function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden>
      <path d="M5 8h14l-1.2 12H6.2L5 8Z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </svg>
  );
}
