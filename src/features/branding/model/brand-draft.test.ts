import { buildBrandPatch, findBrandDraftProblems } from './brand-draft';

const PUBLISHED = { name: 'Studio Norte', color: '#E4572E' };

describe('findBrandDraftProblems', () => {
  it.each([
    ['a valid draft', { name: 'Studio Norte', color: '#2446C7' }, []],
    ['a one-letter name', { name: ' A ', color: '#2446C7' }, ['name-too-short']],
    ['a name over 80 characters', { name: 'a'.repeat(81), color: '#2446C7' }, ['name-too-long']],
    ['half-typed color', { name: 'Studio Norte', color: '#2446' }, ['color-invalid']],
    ['everything wrong', { name: '', color: 'rojo' }, ['name-too-short', 'color-invalid']],
  ])('%s', (_caseName, draft, expectedProblems) => {
    expect(findBrandDraftProblems(draft)).toEqual(expectedProblems);
  });
});

describe('buildBrandPatch', () => {
  it.each([
    ['nothing changed', PUBLISHED, null],
    ['same color in lower case', { ...PUBLISHED, color: '#e4572e' }, null],
    ['only the name', { name: ' Studio Sur ', color: '#E4572E' }, { name: 'Studio Sur' }],
    ['only the color', { name: 'Studio Norte', color: '#2446c7' }, { brandColor: '#2446C7' }],
    [
      'both',
      { name: 'Studio Sur', color: '#2446C7' },
      { name: 'Studio Sur', brandColor: '#2446C7' },
    ],
  ])('%s', (_caseName, draft, expectedPatch) => {
    expect(buildBrandPatch(draft, PUBLISHED)).toEqual(expectedPatch);
  });
});
