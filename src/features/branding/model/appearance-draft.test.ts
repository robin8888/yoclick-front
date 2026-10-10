import { DEFAULT_CENTER_APPEARANCE } from '@/shared/theme';

import {
  buildBackgroundKindChange,
  isAppearanceColorInvalid,
  resolveBackgroundKind,
  resolvePreviewAppearance,
} from './appearance-draft';

const STARTING_COLORS = { start: '#FFFFFF', end: '#FDE9E3' };

describe('resolveBackgroundKind', () => {
  it.each([
    ['nothing chosen', DEFAULT_CENTER_APPEARANCE, 'theme'],
    ['one color', { ...DEFAULT_CENTER_APPEARANCE, backgroundColor: '#1B1F3B' }, 'solid'],
    [
      'two colors',
      { backgroundColor: '#1B1F3B', backgroundColorEnd: '#3A2A6B', hiveColor: null },
      'gradient',
    ],
  ] as const)('%s', (_description, appearance, expectedKind) => {
    expect(resolveBackgroundKind(appearance)).toBe(expectedKind);
  });
});

describe('buildBackgroundKindChange', () => {
  it('starts from the theme colors the first time', () => {
    expect(
      buildBackgroundKindChange('gradient', DEFAULT_CENTER_APPEARANCE, STARTING_COLORS),
    ).toEqual({ backgroundColor: '#FFFFFF', backgroundColorEnd: '#FDE9E3' });
  });

  it('keeps the chosen start color when moving from solid to gradient', () => {
    const solid = { ...DEFAULT_CENTER_APPEARANCE, backgroundColor: '#1B1F3B' };

    expect(buildBackgroundKindChange('gradient', solid, STARTING_COLORS)).toEqual({
      backgroundColor: '#1B1F3B',
      backgroundColorEnd: '#FDE9E3',
    });
  });

  it('drops both colors when going back to the theme', () => {
    const gradient = { backgroundColor: '#1B1F3B', backgroundColorEnd: '#3A2A6B', hiveColor: null };

    expect(buildBackgroundKindChange('theme', gradient, STARTING_COLORS)).toEqual({
      backgroundColor: null,
      backgroundColorEnd: null,
    });
  });
});

describe('resolvePreviewAppearance', () => {
  it('keeps the last valid color while a new one is half typed', () => {
    const published = { backgroundColor: '#1B1F3B', backgroundColorEnd: null, hiveColor: null };
    const draft = { ...published, backgroundColor: '#1B1F' };

    expect(resolvePreviewAppearance(draft, published).backgroundColor).toBe('#1B1F3B');
  });

  it('uses nothing when the draft has no color', () => {
    expect(resolvePreviewAppearance(DEFAULT_CENTER_APPEARANCE, null)).toEqual(
      DEFAULT_CENTER_APPEARANCE,
    );
  });
});

describe('isAppearanceColorInvalid', () => {
  it.each([
    [null, false],
    ['#1B1F3B', false],
    ['#1B1F', true],
  ])('%s', (color, isExpectedInvalid) => {
    expect(isAppearanceColorInvalid(color)).toBe(isExpectedInvalid);
  });
});
