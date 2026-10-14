export function createOrderLine({ sku, qty, priceCents }) {
  return { sku, qty, priceCents };
}

export function lineTotal(line) {
  return line.qty * line.priceCents;
}

export function orderTotal(lines) {
  return lines.reduce((sum, line) => sum + lineTotal(line), 0);
}
