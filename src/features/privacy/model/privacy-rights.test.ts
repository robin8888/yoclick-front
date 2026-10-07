import { formatRequestDate, isDeleteConfirmationWritten } from './privacy-rights';

describe('formatRequestDate', () => {
  it('writes the date the Spanish way', () => {
    expect(formatRequestDate('2026-10-25T10:30:00.000Z')).toBe('25/10/2026');
  });
});

describe('isDeleteConfirmationWritten', () => {
  it.each([
    { caseName: 'the exact word', typedText: 'ELIMINAR', isWritten: true },
    { caseName: 'lowercase', typedText: 'eliminar', isWritten: true },
    { caseName: 'with spaces around', typedText: '  ELIMINAR ', isWritten: true },
    { caseName: 'another word', typedText: 'BORRAR', isWritten: false },
    { caseName: 'a part of it', typedText: 'ELIMIN', isWritten: false },
    { caseName: 'nothing', typedText: '', isWritten: false },
  ])('says $isWritten for $caseName', ({ typedText, isWritten }) => {
    expect(isDeleteConfirmationWritten(typedText)).toBe(isWritten);
  });
});
