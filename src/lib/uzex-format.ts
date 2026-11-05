export function formatInt(n: number): string {
  return new Intl.NumberFormat('uz-UZ').format(n);
}

export function formatTrn(n: number, digits = 2): string {
  return `${n.toFixed(digits)} tn`;
}

export function formatMln(n: number, digits = 1): string {
  return `${n.toFixed(digits)} mln`;
}

export function formatPct(n: number, digits = 1): string {
  return `${n > 0 ? '+' : ''}${n.toFixed(digits)}%`;
}
