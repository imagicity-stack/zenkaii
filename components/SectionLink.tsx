"use client";

import { useStore } from "./Store";

// Scrolls to a section of the home page without putting a #hash in the address bar.
// The href keeps a real fallback for middle-click / open-in-new-tab.
export default function SectionLink({
  to,
  cat,
  className,
  children,
  ...rest
}: { to: string; cat?: string; className?: string; children: React.ReactNode } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  const { goTo } = useStore();
  return (
    <a
      {...rest}
      href={to === "top" ? "/" : "/#" + to}
      className={className}
      onClick={(e) => {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        goTo(to, cat);
      }}
    >
      {children}
    </a>
  );
}
