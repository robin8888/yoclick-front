import { buildHoneycombTile } from './honeycomb-tile';

describe('buildHoneycombTile', () => {
  it('sizes the tile from the cell radius: width is the cell width, height is three radii', () => {
    const tile = buildHoneycombTile(20);

    expect(tile.width).toBeCloseTo(34.64, 2);
    expect(tile.height).toBe(60);
  });

  it('draws the six vertices of a pointy-top cell and the shared vertical edge', () => {
    const { pathData } = buildHoneycombTile(20);

    expect(pathData).toBe(
      'M 0 10 L 17.32 0 L 34.64 10 L 34.64 30 L 17.32 40 L 0 30 Z M 17.32 40 L 17.32 60',
    );
  });
});
