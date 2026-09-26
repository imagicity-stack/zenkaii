// Site-wide knobs. These replace the prototype's Tweaks panel; each can be
// overridden per deployment with a NEXT_PUBLIC_* env var in Vercel.

export type MotionLevel = "Full chaos" | "Maximal" | "Calm";

const num = (v: string | undefined, d: number) => (v !== undefined && v !== "" && !isNaN(+v) ? +v : d);

export const CONFIG = {
  motionLevel: ((process.env.NEXT_PUBLIC_MOTION_LEVEL as MotionLevel) || "Full chaos") as MotionLevel,
  cursorSpirit: process.env.NEXT_PUBLIC_CURSOR_SPIRIT !== "false",
  petalDensity: num(process.env.NEXT_PUBLIC_PETAL_DENSITY, 34),
  // Display only — the real threshold must also be set in Shopify's shipping rates.
  freeCarriageOver: num(process.env.NEXT_PUBLIC_FREE_CARRIAGE_OVER, 200),
  drop: {
    number: process.env.NEXT_PUBLIC_DROP_NUMBER || "009",
    endsAt: process.env.NEXT_PUBLIC_DROP_ENDS_AT || "",
    runSize: num(process.env.NEXT_PUBLIC_DROP_RUN_SIZE, 300),
    remaining: num(process.env.NEXT_PUBLIC_DROP_REMAINING, 84),
  },
};

export function motionFor(level: MotionLevel) {
  if (level === "Calm") return { k: 0.35, tilt: 5, lines: 0.12 };
  if (level === "Maximal") return { k: 0.7, tilt: 9, lines: 0.28 };
  return { k: 1, tilt: 13, lines: 0.42 };
}
