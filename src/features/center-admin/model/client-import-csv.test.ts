import { parseCsvText } from './client-import-csv';

describe('parseCsvText', () => {
  it.each([
    { caseName: 'commas', text: 'Nombre,Correo\nAna,ana@x.es' },
    { caseName: 'semicolons from a Spanish Excel', text: 'Nombre;Correo\nAna;ana@x.es' },
    { caseName: 'tabs', text: 'Nombre\tCorreo\nAna\tana@x.es' },
    {
      caseName: 'Windows line breaks and a byte order mark',
      text: '﻿Nombre,Correo\r\nAna,ana@x.es\r\n',
    },
  ])('reads a file separated by $caseName', ({ text }) => {
    expect(parseCsvText(text)).toEqual([
      ['Nombre', 'Correo'],
      ['Ana', 'ana@x.es'],
    ]);
  });

  it('keeps separators, quotes and line breaks that are inside quotes', () => {
    const text = 'Nombre,Notas\n"Pérez, Ana","Dice ""hola""\ny adiós"';

    expect(parseCsvText(text)).toEqual([
      ['Nombre', 'Notas'],
      ['Pérez, Ana', 'Dice "hola"\ny adiós'],
    ]);
  });

  it('ignores blank lines and trims cells', () => {
    expect(parseCsvText('Nombre,Correo\n\n  Ana , ana@x.es \n,\n')).toEqual([
      ['Nombre', 'Correo'],
      ['Ana', 'ana@x.es'],
    ]);
  });

  it('returns nothing for an empty file', () => {
    expect(parseCsvText('')).toEqual([]);
  });
});
