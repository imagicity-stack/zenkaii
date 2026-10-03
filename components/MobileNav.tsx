"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { BagIcon, SearchIcon } from "./Header";
import { railId, useCategories } from "./ProductRails";
import { useStore } from "./Store";

// Mobile only (hidden on desktop by CSS): bottom tab bar + floating category pill.
export default function MobileNav() {
  const { count, openDrawer, openSearch, goTo, search, drawer, refs } = useStore();
  const pathname = usePathname();
  const onHome = pathname === "/" || pathname.startsWith("/products/");

  return (
    <>
      {onHome && !search && !drawer && <CategoryPill />}
      <nav className="zk-tabbar" aria-label="App">
        <button className={"zk-tab" + (search ? " is-on" : "")} onClick={openSearch}>
          <SearchIcon />
          <span>Search</span>
        </button>
        <button className={"zk-tab zk-tab-home" + (onHome && !search && !drawer ? " is-on" : "")} onClick={() => goTo("top")}>
          <span className="zk-tab-mark">
            <img src="/zenkaii-mask.png" alt="" />
          </span>
          <span>Home</span>
        </button>
        <button ref={refs.cartBtnMobile} className={"zk-tab" + (drawer ? " is-on" : "")} onClick={openDrawer} aria-label={`Cart, ${count} items`}>
          <span className="zk-tab-bag">
            <BagIcon />
            <span ref={refs.badgeMobile} className="zk-tab-badge" data-empty={count === 0 || undefined}>{count}</span>
          </span>
          <span>Cart</span>
        </button>
      </nav>
    </>
  );
}

function CategoryPill() {
  const { goTo } = useStore();
  const cats = useCategories();
  const [open, setOpen] = useState(false);
  if (!cats.length) return null;

  const pick = (cat: string) => {
    setOpen(false);
    // Jump to the category's row when it has one, otherwise to the filtered shop grid.
    if (document.getElementById(railId(cat))) goTo(railId(cat));
    else goTo("shop", cat);
  };

  return (
    <div className={"zk-catpill" + (open ? " is-open" : "")}>
      {open && (
        <div className="zk-catpill-menu" role="menu">
          <button role="menuitem" onClick={() => { setOpen(false); goTo("shop", "ALL"); }}>All relics</button>
          {cats.map((c) => (
            <button key={c} role="menuitem" onClick={() => pick(c)}>{c.charAt(0) + c.slice(1).toLowerCase()}</button>
          ))}
        </div>
      )}
      <div className="zk-catpill-bar">
        {cats.slice(0, 3).map((c) => (
          <button key={c} onClick={() => pick(c)}>{c.charAt(0) + c.slice(1).toLowerCase()}</button>
        ))}
        <button className="zk-catpill-toggle" aria-expanded={open} aria-label={open ? "Fewer categories" : "All categories"} onClick={() => setOpen((o) => !o)}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m6 15 6-6 6 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
