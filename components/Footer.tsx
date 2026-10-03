"use client";

import { CONTACT_EMAIL, FOOTER_COLS, type FooterLink } from "@/lib/content";
import type { ShopLinks } from "@/lib/types";
import SectionLink from "./SectionLink";
import { useStore } from "./Store";

export default function Footer({ links }: { links: ShopLinks }) {
  const { products } = useStore();

  const render = (l: FooterLink) => {
    if (l.section) {
      // Skip category shortcuts the live catalogue doesn't carry.
      if (l.cat && l.cat !== "ALL" && !products.some((p) => p.cat === l.cat)) return null;
      return <SectionLink key={l.label} to={l.section} cat={l.cat}>{l.label}</SectionLink>;
    }
    // Without a connected store, Shopify-hosted pages fall back to email.
    const href = (l.shop && links[l.shop]) || l.href || `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(l.label)}`;
    const external = href.startsWith("http");
    return (
      <a key={l.label} href={href} {...(external ? { target: "_blank", rel: "noopener" } : {})}>
        {l.label}
      </a>
    );
  };

  return (
    <footer className="zk-footer">
      <div className="zk-footer-grid">
        <div>
          <div className="zk-footer-mark">
            <img src="/zenkaii-mask.png" alt="Zenkaii" className="zk-fill" />
          </div>
          <div className="zk-footer-name">ZENKAII</div>
          <p>Spirit-forged apparel, struck once and never again. Kyoto — Berlin — nowhere.</p>
        </div>
        {FOOTER_COLS.map((f) => (
          <div key={f.head}>
            <div className="zk-footer-head">{f.head}</div>
            <div className="zk-footer-links">{f.links.map(render)}</div>
          </div>
        ))}
      </div>
      <div className="zk-footer-base">
        <span>© {new Date().getFullYear()} ZENKAII — ALL OATHS RESERVED</span>
        <span>ゼンカイ / 狐面 / 誓約</span>
      </div>
    </footer>
  );
}
