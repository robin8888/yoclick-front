import { buildColorGrid, buildHueWheelColors, convertHslToHex } from './color-grid';

describe('convertHslToHex', () => {
  it.each([
    [{ hueDegrees: 0, saturationPercent: 100, lightnessPercent: 50 }, '#FF0000'],
    [{ hueDegrees: 120, saturationPercent: 100, lightnessPercent: 50 }, '#00FF00'],
    [{ hueDegrees: 240, saturationPercent: 100, lightnessPercent: 50 }, '#0000FF'],
    [{ hueDegrees: 60, saturationPercent: 100, lightnessPercent: 50 }, '#FFFF00'],
    [{ hueDegrees: 0, saturationPercent: 0, lightnessPercent: 100 }, '#FFFFFF'],
    [{ hueDegrees: 0, saturationPercent: 0, lightnessPercent: 0 }, '#000000'],
  ])('%j is %s', (hslColor, expectedHex) => {
    expect(convertHslToHex(hslColor)).toBe(expectedHex);
  });
});

describe('buildColorGrid', () => {
  it('lists twelve hues in four lightness levels, all valid and different', () => {
    const grid = buildColorGrid();

    expect(grid).toHaveLength(48);
    expect(new Set(grid).size).toBe(48);
    expect(grid.every((hexColor) => /^#[0-9A-F]{6}$/.test(hexColor))).toBe(true);
  });
});

describe('buildHueWheelColors', () => {
  it('gives the twelve hues starting at a warm red', () => {
    const wheel = buildHueWheelColors();

    expect(wheel).toHaveLength(12);
    expect(wheel[0]).toMatch(/^#E[0-9A-F]/);
    expect(new Set(wheel).size).toBe(12);
  });
});
