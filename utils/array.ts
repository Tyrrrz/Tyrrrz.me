export const groupBy = <T, K>(array: T[], getKey: (item: T) => K) => {
  const map = array.reduce((acc, item) => {
    const key = getKey(item);
    const items = acc.get(key) || [];
    items.push(item);
    acc.set(key, items);

    return acc;
  }, new Map<K, T[]>());

  return [...map.entries()].map(([key, items]) => ({ key, items }));
};

export const distinctBy = <T, K>(array: T[], getKey: (item: T) => K) => {
  const map = array.reduce((acc, item) => {
    const key = getKey(item);
    acc.set(key, item);

    return acc;
  }, new Map<K, T>());

  return [...map.values()];
};
