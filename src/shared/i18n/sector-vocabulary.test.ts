import {
  SECTOR_IDS,
  SECTOR_VOCABULARY,
  capitalizeFirstLetter,
  getSectorVocabulary,
} from './sector-vocabulary';

describe('getSectorVocabulary', () => {
  it.each([
    {
      sectorId: 'gym',
      staff: ['instructor', 'instructores'],
      client: 'clientes',
      sessions: 'sesiones',
      tab: 'Entrenar',
    },
    {
      sectorId: 'estudio',
      staff: ['instructor', 'instructores'],
      client: 'clientes',
      sessions: 'sesiones',
      tab: 'Entrenar',
    },
    {
      sectorId: 'readap',
      staff: ['profesional', 'profesionales'],
      client: 'clientes',
      sessions: 'sesiones',
      tab: 'Entrenar',
    },
    {
      sectorId: 'box',
      staff: ['coach', 'coaches'],
      client: 'clientes',
      sessions: 'sesiones',
      tab: 'Entrenar',
    },
    {
      sectorId: 'yoga',
      staff: ['profesor', 'profesores'],
      client: 'alumnos',
      sessions: 'clases',
      tab: 'Practicar',
    },
    {
      sectorId: 'academia',
      staff: ['profesor', 'profesores'],
      client: 'alumnos',
      sessions: 'clases',
      tab: 'Estudiar',
    },
    {
      sectorId: 'baile',
      staff: ['profesor', 'profesores'],
      client: 'alumnos',
      sessions: 'clases',
      tab: 'Practicar',
    },
    {
      sectorId: 'marciales',
      staff: ['maestro', 'maestros'],
      client: 'alumnos',
      sessions: 'clases',
      tab: 'Practicar',
    },
    {
      sectorId: 'musica',
      staff: ['profesor', 'profesores'],
      client: 'alumnos',
      sessions: 'clases',
      tab: 'Practicar',
    },
    {
      sectorId: 'cocina',
      staff: ['chef', 'chefs'],
      client: 'alumnos',
      sessions: 'clases',
      tab: 'Aprender',
    },
    {
      sectorId: 'otro',
      staff: ['profesional', 'profesionales'],
      client: 'clientes',
      sessions: 'clases',
      tab: 'Contenido',
    },
  ])('$sectorId uses its own staff, client and session words', (expectedWords) => {
    const vocabulary = getSectorVocabulary(expectedWords.sectorId);

    expect([vocabulary.staff.singular, vocabulary.staff.plural]).toEqual(expectedWords.staff);
    expect(vocabulary.client.plural).toBe(expectedWords.client);
    expect(vocabulary.session.plural).toBe(expectedWords.sessions);
    expect(vocabulary.contentTabLabel).toBe(expectedWords.tab);
  });

  it('defines every sector id from the product spec', () => {
    expect(SECTOR_IDS).toHaveLength(11);
    expect(
      Object.keys(SECTOR_VOCABULARY).sort((first, second) => first.localeCompare(second)),
    ).toEqual([...SECTOR_IDS].sort((first, second) => first.localeCompare(second)));
  });

  it.each([
    ['gym', ['Inicio', 'Base', 'Avanzado']],
    ['yoga', ['Iniciación', 'Intermedio', 'Avanzado']],
    ['academia', ['Básico', 'Intermedio', 'Avanzado']],
    ['marciales', ['Principiante', 'Intermedio', 'Avanzado']],
  ])('gives %s the levels %j', (sectorId, expectedLevels) => {
    expect(getSectorVocabulary(sectorId).levels).toEqual(expectedLevels);
  });

  it.each([undefined, null, '', 'spa', 'GYM'])(
    'falls back to the neutral sector for %j',
    (unknownId) => {
      expect(getSectorVocabulary(unknownId).sectorId).toBe('otro');
    },
  );

  it('never uses gym-only words outside the gym family', () => {
    const nonGymSectors = SECTOR_IDS.filter((sectorId) => !['gym', 'estudio'].includes(sectorId));

    nonGymSectors.forEach((sectorId) => {
      expect(SECTOR_VOCABULARY[sectorId].staff.singular).not.toBe('instructor');
    });
  });
});

describe('capitalizeFirstLetter', () => {
  it.each([
    ['instructor', 'Instructor'],
    ['álbum', 'Álbum'],
    ['', ''],
    ['Chef', 'Chef'],
  ])('turns «%s» into «%s»', (word, expectedWord) => {
    expect(capitalizeFirstLetter(word)).toBe(expectedWord);
  });
});
