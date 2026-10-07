import { getSpecialtyOptions, LANGUAGE_OPTIONS, mergeWithChosen } from './sector-specialties';

describe('getSpecialtyOptions', () => {
  it.each([
    { caseName: 'a gym', sectorId: 'gym', first: 'Fuerza' },
    { caseName: 'a yoga studio', sectorId: 'yoga', first: 'Respiración' },
    { caseName: 'an academy', sectorId: 'academia', first: 'Inglés' },
    { caseName: 'a dance school', sectorId: 'baile', first: 'Salsa' },
    { caseName: 'a cooking school', sectorId: 'cocina', first: 'Técnicas' },
    { caseName: 'another kind of center', sectorId: 'otro', first: 'General' },
    { caseName: 'an unknown sector', sectorId: 'desconocido', first: 'General' },
    { caseName: 'no sector loaded yet', sectorId: undefined, first: 'General' },
  ])('offers the specialties of $caseName', ({ sectorId, first }) => {
    expect(getSpecialtyOptions(sectorId)[0]).toBe(first);
  });
});

describe('mergeWithChosen', () => {
  it('keeps the options and adds what was chosen outside of them', () => {
    expect(mergeWithChosen(['Fuerza', 'Cardio'], ['Cardio', 'Yoga'])).toEqual([
      'Fuerza',
      'Cardio',
      'Yoga',
    ]);
  });

  it('adds nothing when everything chosen is an option', () => {
    expect(mergeWithChosen(['Fuerza'], ['Fuerza'])).toEqual(['Fuerza']);
  });
});

describe('LANGUAGE_OPTIONS', () => {
  it('starts with the language of the app', () => {
    expect(LANGUAGE_OPTIONS[0]).toBe('Castellano');
  });
});
