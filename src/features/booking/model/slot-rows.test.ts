import { chunkIntoRows } from './slot-rows';

describe('chunkIntoRows', () => {
  it.each([
    { items: [], columnCount: 4, expectedRows: [] },
    { items: [1, 2, 3, 4], columnCount: 4, expectedRows: [[1, 2, 3, 4]] },
    { items: [1, 2, 3, 4, 5], columnCount: 4, expectedRows: [[1, 2, 3, 4], [5]] },
    { items: [1, 2, 3], columnCount: 2, expectedRows: [[1, 2], [3]] },
  ])('splits $items into rows of $columnCount', ({ items, columnCount, expectedRows }) => {
    expect(chunkIntoRows(items, columnCount)).toEqual(expectedRows);
  });
});
