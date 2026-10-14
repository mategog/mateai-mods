const counters = new Map();

export function nextId(prefix) {
  const n = (counters.get(prefix) ?? 0) + 1;
  counters.set(prefix, n);
  return `${prefix}_${n}`;
}
