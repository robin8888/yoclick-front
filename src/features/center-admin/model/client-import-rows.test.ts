import {
  buildImportRows,
  guessImportFields,
  parseImportLevel,
  splitIntoImportBatches,
  summarizeImportRows,
} from './client-import-rows';

describe('guessImportFields', () => {
  it.each([
    {
      caseName: 'Spanish headers',
      header: ['Nombre completo', 'Correo electrónico', 'Teléfono', 'Nivel', 'Notas'],
      expected: ['name', 'email', 'phone', 'level', 'skip'],
    },
    {
      caseName: 'English headers',
      header: ['Name', 'E-mail', 'Phone'],
      expected: ['name', 'email', 'phone'],
    },
    {
      caseName: 'a second column that looks like a name',
      header: ['Nombre', 'Apellidos'],
      expected: ['name', 'skip'],
    },
  ])('recognises $caseName', ({ header, expected }) => {
    expect(guessImportFields(header)).toEqual(expected);
  });
});

describe('parseImportLevel', () => {
  it.each([
    ['Principiante', 'beginner'],
    ['intermedio', 'intermediate'],
    ['Avanzado', 'advanced'],
    ['', null],
    ['otro', null],
  ])('reads «%s» as %s', (text, expected) => {
    expect(parseImportLevel(text)).toBe(expected);
  });
});

describe('buildImportRows', () => {
  const fieldByColumn = ['name', 'email', 'phone', 'level', 'skip'] as const;

  it('builds rows from the mapped columns', () => {
    const rows = buildImportRows({
      dataRows: [['Ana Pérez', 'ana@x.es', '600111222', 'Avanzado', 'nota']],
      fieldByColumn,
    });

    expect(rows).toEqual([
      { fullName: 'Ana Pérez', email: 'ana@x.es', phone: '600111222', level: 'advanced' },
    ]);
  });

  it('drops empty rows, uses the email as name when there is none and nulls invalid emails', () => {
    const rows = buildImportRows({
      dataRows: [
        ['', '', '', '', ''],
        ['', 'solo@x.es', '', '', ''],
        ['Sin arroba', 'no-es-correo', '', '', ''],
      ],
      fieldByColumn,
    });

    expect(rows).toEqual([
      { fullName: 'solo@x.es', email: 'solo@x.es', phone: null, level: null },
      { fullName: 'Sin arroba', email: null, phone: null, level: null },
    ]);
  });

  it('works when the file has no column for a field', () => {
    const rows = buildImportRows({
      dataRows: [['Ana', 'ana@x.es']],
      fieldByColumn: ['name', 'email'],
    });

    expect(rows).toEqual([{ fullName: 'Ana', email: 'ana@x.es', phone: null, level: null }]);
  });
});

describe('summarizeImportRows', () => {
  it('counts what will be imported, what has no email and what is repeated', () => {
    const rows = [
      { fullName: 'A', email: 'a@x.es' },
      { fullName: 'A2', email: 'A@x.es' },
      { fullName: 'B', email: null },
      { fullName: 'C', email: 'c@x.es' },
    ];

    expect(summarizeImportRows(rows)).toEqual({
      importableCount: 2,
      withoutEmailCount: 1,
      repeatedCount: 1,
    });
  });
});

describe('splitIntoImportBatches', () => {
  it('splits a big file in batches of at most 500 rows', () => {
    const rows = Array.from({ length: 1201 }, (_, index) => ({
      fullName: `P${String(index)}`,
      email: null,
    }));

    expect(splitIntoImportBatches(rows).map((batch) => batch.length)).toEqual([500, 500, 201]);
  });
});
