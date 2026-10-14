// Flat 500 cents plus 50 cents per unit, free from 20 units.
export function shippingCost(lines) {
  const units = lines.reduce((sum, line) => sum + line.qty, 0);
  if (units >= 20) return 0;
  return 500 + units * 50;
}
