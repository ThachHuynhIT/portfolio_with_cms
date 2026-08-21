// Groups items by a derived key, preserving each group's relative item
// order. Callers on the About page (Phase 10 PR 10) pass an array already
// sorted by `order` (skills/experience are both fetched with
// `orderBy: { order: "asc" }`), so Map's insertion-order guarantee also
// gives "group order follows min(item.order) in that group" for free,
// without a separate sort step.
export function groupBy<T, K extends string>(
  items: T[],
  keyFn: (item: T) => K,
): Map<K, T[]> {
  const groups = new Map<K, T[]>();
  for (const item of items) {
    const key = keyFn(item);
    const group = groups.get(key);
    if (group) {
      group.push(item);
    } else {
      groups.set(key, [item]);
    }
  }
  return groups;
}
