import { lineTotal } from './orders.js';

// 10% off a line when 10 or more units are bought.
export function bulkDiscount(line) {
  return line.qty >= 10 ? Math.round(lineTotal(line) * 0.1) : 0;
}
