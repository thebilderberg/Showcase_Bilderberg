export const defaultOrder = ['clock', 'oculus', 'codex', 'opus', 'speculum', 'ouroboros'];

const oldWidgetIds: Record<string, string> = {
  interface: 'oculus',
  logic: 'codex',
  data: 'opus',
  testing: 'speculum',
  delivery: 'ouroboros',
};

export function moveItem(order: string[], from: number, to: number) {
  if (from < 0 || to < 0 || from >= order.length || to >= order.length) return order;

  const result = [...order];
  const [item] = result.splice(from, 1);
  result.splice(to, 0, item);
  return result;
}

export function validOrder(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length === defaultOrder.length &&
    new Set(value).size === defaultOrder.length &&
    value.every((id) => defaultOrder.includes(id))
  );
}

export function restoreOrder(value: unknown): string[] {
  if (validOrder(value)) return value;
  if (!Array.isArray(value) || new Set(value).size !== value.length) return [...defaultOrder];

  const knownIds = [...defaultOrder, ...Object.keys(oldWidgetIds), 'details'];
  if (!value.every((id) => typeof id === 'string' && knownIds.includes(id)))
    return [...defaultOrder];

  const migrated = value.filter((id) => id !== 'details').map((id) => oldWidgetIds[id] || id);
  if (!migrated.includes('clock')) migrated.unshift('clock');

  return validOrder(migrated) ? migrated : [...defaultOrder];
}
