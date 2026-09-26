import { FOOTER_COLS } from "@/lib/content";

export default function Footer() {
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
            <div className="zk-footer-links">
              {f.links.map((lk) => (
                <a key={lk} href={lk.includes("@") ? "mailto:" + lk : "#top"}>{lk}</a>
              ))}
            </div>
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
