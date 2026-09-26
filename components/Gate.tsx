// Torii chapter break. It scales up as you scroll through it (driven by Effects).
export default function Gate({ variant, label, kana }: { variant: "crimson" | "ivory"; label: string; kana: string }) {
  return (
    <div data-gate className={`zk-gate zk-gate-${variant}`} role="presentation">
      <div className="zk-gate-glow" />
      <div data-gatescale className="zk-gate-frame">
        <div className="zk-gate-kasagi" />
        <div className="zk-gate-shimaki" />
        <div className="zk-gate-nuki" />
        <div className="zk-gate-pillar zk-gate-pl" />
        <div className="zk-gate-pillar zk-gate-pr" />
        <div className="zk-gate-label">{label}</div>
        <div className="zk-gate-kana">{kana}</div>
      </div>
    </div>
  );
}
