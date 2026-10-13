import { calculateContrastRatio } from './brand-engine';
import { FINISHED_PALETTE } from './finished-palette';

const MIN_READABLE_CONTRAST = 4.5;

describe('FINISHED_PALETTE', () => {
  it('keeps the white text readable on the grey background', () => {
    expect(
      calculateContrastRatio(FINISHED_PALETTE.background, FINISHED_PALETTE.text),
    ).toBeGreaterThanOrEqual(MIN_READABLE_CONTRAST);
  });
});
