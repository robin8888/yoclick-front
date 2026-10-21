/** Reparte los elementos en filas de `columnCount`; la última puede quedar incompleta. */
export function chunkIntoRows<Item>(items: readonly Item[], columnCount: number): Item[][] {
  const rows: Item[][] = [];
  for (let startIndex = 0; startIndex < items.length; startIndex += columnCount) {
    rows.push(items.slice(startIndex, startIndex + columnCount));
  }
  return rows;
}
