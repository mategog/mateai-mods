import { nextId } from './ids.js';

export function createCustomer({ name, email }) {
  return { id: nextId('cus'), name, email };
}
