import { filterContactsByName } from './contact-search';

const CONTACTS = [
  { fullName: 'María Pérez' },
  { fullName: 'Luis Pardo' },
  { fullName: 'Ana Maria Ruiz' },
];

describe('filterContactsByName', () => {
  it.each([
    ['', ['María Pérez', 'Luis Pardo', 'Ana Maria Ruiz']],
    ['   ', ['María Pérez', 'Luis Pardo', 'Ana Maria Ruiz']],
    ['luis', ['Luis Pardo']],
    ['PARDO', ['Luis Pardo']],
    ['maria', ['María Pérez', 'Ana Maria Ruiz']],
    ['pérez', ['María Pérez']],
    ['perez', ['María Pérez']],
    ['zzz', []],
  ])('searching "%s" finds %j', (searchText, expectedNames) => {
    const foundNames = filterContactsByName(CONTACTS, searchText).map(({ fullName }) => fullName);
    expect(foundNames).toEqual(expectedNames);
  });
});
