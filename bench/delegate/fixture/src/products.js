import { nextId } from './ids.js';

export function createProduct({ sku, name, priceCents }) {
  return { id: nextId('prd'), sku, name, priceCents };
}
