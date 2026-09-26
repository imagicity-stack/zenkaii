// Imperative motion helpers ported from the prototype. They write styles directly
// so the per-frame work never goes through React.

export function tiltMove(el: HTMLElement, clientX: number, clientY: number, T: number) {
  const r = el.getBoundingClientRect();
  const px = (clientX - r.left) / r.width - 0.5;
  const py = (clientY - r.top) / r.height - 0.5;
  el.style.transform =
    "perspective(900px) rotateY(" + (px * T).toFixed(2) + "deg) rotateX(" + (-py * T).toFixed(2) + "deg) translateZ(14px) scale(1.022)";
  el.querySelectorAll<HTMLElement>("[data-depth]").forEach((d) => {
    const z = parseFloat(d.dataset.depth || "0") || 0;
    const base = d.hasAttribute("data-center") ? "translate(-50%,-50%) " : "";
    d.style.transform = base + "translate3d(" + (-px * z).toFixed(1) + "px," + (-py * z).toFixed(1) + "px,0)";
  });
}

export function tiltReset(el: HTMLElement) {
  el.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg) translateZ(0) scale(1)";
  el.querySelectorAll<HTMLElement>("[data-depth]").forEach((d) => {
    d.style.transform = (d.hasAttribute("data-center") ? "translate(-50%,-50%) " : "") + "translate3d(0,0,0)";
  });
}

// Product arcs into the cart button with a spark trail, then the badge pops.
export function flyToCart(origin: HTMLElement | null, btn: HTMLElement | null, badge: HTMLElement | null, host: HTMLElement | null) {
  if (!host || !btn || !origin) return;
  const a = origin.getBoundingClientRect();
  const b = btn.getBoundingClientRect();
  const g = document.createElement("div");
  g.style.cssText =
    "position:fixed;left:" + a.left + "px;top:" + a.top + "px;width:" + a.width + "px;height:" + a.height +
    "px;border:1px solid #C1121F;background:radial-gradient(circle,rgba(193,18,31,.55),rgba(8,7,10,.9));box-shadow:0 0 34px rgba(193,18,31,.8);pointer-events:none";
  host.appendChild(g);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  g.animate(
    [
      { transform: "translate(0,0) scale(1) rotate(0deg)", opacity: 1, borderRadius: "0%" },
      { transform: "translate(" + dx * 0.45 + "px," + (dy * 0.3 - 130) + "px) scale(.46) rotate(160deg)", opacity: 0.95, borderRadius: "50%", offset: 0.55 },
      { transform: "translate(" + dx + "px," + dy + "px) scale(.05) rotate(420deg)", opacity: 0, borderRadius: "50%" },
    ],
    { duration: 820, easing: "cubic-bezier(.5,0,.6,1)" }
  ).onfinish = () => g.remove();

  for (let i = 0; i < 9; i++) {
    const t = document.createElement("div");
    const s = 3 + Math.random() * 6;
    t.style.cssText =
      "position:fixed;left:" + (a.left + a.width / 2) + "px;top:" + (a.top + a.height / 2) + "px;width:" + s + "px;height:" + s +
      "px;background:" + (i % 2 ? "#E8324A" : "#F2EDE4") + ";transform:rotate(45deg);pointer-events:none;box-shadow:0 0 12px rgba(232,50,74,.9)";
    host.appendChild(t);
    t.animate(
      [
        { transform: "translate(0,0) scale(1)", opacity: 1 },
        { transform: "translate(" + dx * (0.5 + Math.random() * 0.6) + "px," + (dy * 0.4 - 90 - Math.random() * 120) + "px) scale(1.4)", opacity: 0.9, offset: 0.5 },
        { transform: "translate(" + dx + "px," + dy + "px) scale(0)", opacity: 0 },
      ],
      { duration: 720 + i * 46, easing: "cubic-bezier(.4,0,.6,1)", delay: i * 22 }
    ).onfinish = () => t.remove();
  }
  setTimeout(() => {
    if (badge) {
      badge.style.animation = "none";
      void badge.offsetWidth;
      badge.style.animation = "zk-pop .5s cubic-bezier(.3,1.6,.4,1)";
    }
    btn.animate([{ transform: "scale(1)" }, { transform: "scale(.9)" }, { transform: "scale(1.06)" }, { transform: "scale(1)" }], { duration: 420, easing: "ease-out" });
  }, 700);
}
