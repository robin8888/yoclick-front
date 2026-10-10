import { buildMyDataPatch, findMyDataProblems } from './my-data-form';

describe('findMyDataProblems', () => {
  it.each([
    ['nothing filled in', { phone: '', address: '' }, []],
    ['a valid phone and address', { phone: '+34 600 123 456', address: 'Calle Mayor 12' }, []],
    ['a phone with letters', { phone: '600abc', address: '' }, ['phone-invalid']],
    ['a phone that is too short', { phone: '123', address: '' }, ['phone-invalid']],
    [
      'an address over 200 characters',
      { phone: '', address: 'a'.repeat(201) },
      ['address-too-long'],
    ],
  ])('%s', (_description, draft, expectedProblems) => {
    expect(findMyDataProblems(draft)).toEqual(expectedProblems);
  });
});

describe('buildMyDataPatch', () => {
  const SAVED = { phone: '+34 600 123 456', address: null };

  it.each([
    ['nothing changed', { phone: '+34 600 123 456', address: '' }, null],
    ['spaces around the same value', { phone: ' +34 600 123 456 ', address: '  ' }, null],
    [
      'a new address',
      { phone: '+34 600 123 456', address: ' Calle Mayor 12 ' },
      { address: 'Calle Mayor 12' },
    ],
    ['the phone removed', { phone: '', address: '' }, { phone: null }],
    [
      'both changed',
      { phone: '600 000 000', address: 'Plaza Sol 1' },
      { phone: '600 000 000', address: 'Plaza Sol 1' },
    ],
  ])('%s', (_description, draft, expectedPatch) => {
    expect(buildMyDataPatch(draft, SAVED)).toEqual(expectedPatch);
  });
});
