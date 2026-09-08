export const VAT_RATE = 0.25;

/** Split a price that INCLUDES 25% VAT into net + VAT amount. Rounded to whole kr. */
export function vatBreakdown(gross: number) {
  const vat = Math.round((gross * VAT_RATE) / (1 + VAT_RATE));
  return { net: gross - vat, vat, gross };
}

export function formatKr(n: number) {
  return `${n.toLocaleString("sv-SE")} kr`;
}
