// stock is a Map of sku -> available qty
export function reserve(stock, sku, qty) {
  const available = stock.get(sku) ?? 0;
  if (qty > available) {
    return { ok: false, short: qty - available };
  }
  stock.set(sku, available - qty);
  return { ok: true, short: 0 };
}

export function restock(stock, sku, qty) {
  stock.set(sku, (stock.get(sku) ?? 0) + qty);
}
