import { CONFIG } from "@/lib/config";
import { tickerItems } from "@/lib/content";
import { money } from "@/lib/money";

export default function Ticker() {
  const t = tickerItems(money(CONFIG.freeCarriageOver));
  // Rendered twice so the strip wraps seamlessly on the duplicate's first child.
  const items = [...t, ...t];
  return (
    <div className="zk-ticker">
      <div data-marquee className="zk-ticker-track">
        {items.map((s, i) => (
          <span key={i} aria-hidden={i >= t.length}>
            {s}
            <span className="zk-ticker-dot" />
          </span>
        ))}
      </div>
    </div>
  );
}
