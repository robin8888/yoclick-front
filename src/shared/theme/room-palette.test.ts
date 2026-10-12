import { calculateContrastRatio } from './brand-engine';
import { pickRoomPaletteColor, ROOM_PALETTE_SIZE } from './room-palette';

const MIN_READABLE_CONTRAST = 4.5;

describe('pickRoomPaletteColor', () => {
  it('gives every room of the palette a readable letter color', () => {
    for (let index = 0; index < ROOM_PALETTE_SIZE; index += 1) {
      const { background, text } = pickRoomPaletteColor(index);
      expect(calculateContrastRatio(background, text)).toBeGreaterThanOrEqual(
        MIN_READABLE_CONTRAST,
      );
    }
  });

  it('gives different colors to the first rooms and repeats after the palette ends', () => {
    const backgrounds = Array.from(
      { length: ROOM_PALETTE_SIZE },
      (_unused, index) => pickRoomPaletteColor(index).background,
    );

    expect(new Set(backgrounds).size).toBe(ROOM_PALETTE_SIZE);
    expect(pickRoomPaletteColor(ROOM_PALETTE_SIZE)).toEqual(pickRoomPaletteColor(0));
    expect(pickRoomPaletteColor(-1)).toEqual(pickRoomPaletteColor(ROOM_PALETTE_SIZE - 1));
  });
});
