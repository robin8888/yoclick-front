import { DEFAULT_CENTER_APPEARANCE } from '@/shared/theme';

import { buildBrandPatch, findBrandDraftProblems, type BrandDraft } from './brand-draft';

const NO_APPEARANCE = DEFAULT_CENTER_APPEARANCE;
const PUBLISHED: BrandDraft = {
  name: 'Studio Norte',
  color: '#E4572E',
  appearance: NO_APPEARANCE,
};

describe('findBrandDraftProblems', () => {
  const valid: BrandDraft = { ...PUBLISHED, color: '#2446C7' };

  it.each<[string, BrandDraft, string[]]>([
    ['a valid draft', valid, []],
    ['a one-letter name', { ...valid, name: ' A ' }, ['name-too-short']],
    ['a name over 80 characters', { ...valid, name: 'a'.repeat(81) }, ['name-too-long']],
    ['half-typed color', { ...valid, color: '#2446' }, ['color-invalid']],
    [
      'everything wrong',
      { ...valid, name: '', color: 'rojo' },
      ['name-too-short', 'color-invalid'],
    ],
    [
      'a valid Premium appearance',
      { ...valid, appearance: { ...NO_APPEARANCE, hiveColor: '#F2C94C' } },
      [],
    ],
    [
      'a half-typed hive color',
      { ...valid, appearance: { ...NO_APPEARANCE, hiveColor: '#F2C9' } },
      ['appearance-color-invalid'],
    ],
  ])('%s', (_caseName, draft, expectedProblems) => {
    expect(findBrandDraftProblems(draft)).toEqual(expectedProblems);
  });
});

describe('buildBrandPatch', () => {
  const gradientAppearance = {
    backgroundColor: '#1B1F3B',
    backgroundColorEnd: '#3A2A6B',
    hiveColor: '#F2C94C',
  };

  it.each([
    ['nothing changed', PUBLISHED, null],
    ['same color in lower case', { ...PUBLISHED, color: '#e4572e' }, null],
    ['only the name', { ...PUBLISHED, name: ' Studio Sur ' }, { name: 'Studio Sur' }],
    ['only the color', { ...PUBLISHED, color: '#2446c7' }, { brandColor: '#2446C7' }],
    [
      'both',
      { ...PUBLISHED, name: 'Studio Sur', color: '#2446C7' },
      { name: 'Studio Sur', brandColor: '#2446C7' },
    ],
    [
      'a solid background',
      { ...PUBLISHED, appearance: { ...NO_APPEARANCE, backgroundColor: '#1b1f3b' } },
      { backgroundColor: '#1B1F3B' },
    ],
    [
      'a gradient and a hive color',
      { ...PUBLISHED, appearance: gradientAppearance },
      gradientAppearance,
    ],
  ])('%s', (_caseName, draft, expectedPatch) => {
    expect(buildBrandPatch(draft, PUBLISHED)).toEqual(expectedPatch);
  });

  describe('when removing the Premium appearance', () => {
    const publishedGradient: BrandDraft = { ...PUBLISHED, appearance: gradientAppearance };

    it('sends null for each color that was removed', () => {
      const draft = { ...publishedGradient, appearance: NO_APPEARANCE };

      expect(buildBrandPatch(draft, publishedGradient)).toEqual({
        backgroundColor: null,
        backgroundColorEnd: null,
        hiveColor: null,
      });
    });

    it('also removes the end color when only the start color is removed', () => {
      const draft = {
        ...publishedGradient,
        appearance: { ...gradientAppearance, backgroundColor: null },
      };

      expect(buildBrandPatch(draft, publishedGradient)).toEqual({
        backgroundColor: null,
        backgroundColorEnd: null,
      });
    });
  });
});
