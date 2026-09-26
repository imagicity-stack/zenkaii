const cache = new Map<string, Intl.NumberFormat>();

export function money(n: number, currency = "USD") {
  const whole = Number.isInteger(n);
  const key = currency + (whole ? ":0" : ":2");
  let f = cache.get(key);
  if (!f) {
    f = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: whole ? 0 : 2,
      maximumFractionDigits: whole ? 0 : 2,
    });
    cache.set(key, f);
  }
  return f.format(n);
}
