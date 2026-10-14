import { orderTotal } from './orders.js';
import { bulkDiscount } from './discounts.js';
import { shippingCost } from './shipping.js';
import { formatMoney } from './money.js';

export function summarize(lines) {
  const units = lines.reduce((sum, line) => sum + line.qty, 0);
  const subtotal = orderTotal(lines);
  const discount = lines.reduce((sum, line) => sum + bulkDiscount(line), 0);
  const shipping = shippingCost(lines);
  const total = subtotal - discount + shipping;
  return { units, subtotal, discount, shipping, total, display: formatMoney(total) };
}
