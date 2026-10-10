import { describeAssignments } from './content-captions';

const WORDS = { levelWords: ['Inicio', 'Base', 'Avanzado'], clientWord: 'Cliente' } as const;

describe('describeAssignments', () => {
  it('says it is unassigned when nobody sees it', () => {
    expect(describeAssignments([], WORDS)).toBe('Sin asignar');
  });

  it('names each target with its kind, using the words of the sector', () => {
    const caption = describeAssignments(
      [
        {
          id: 'a1',
          level: 'intermediate',
          groupId: null,
          clientMembershipId: null,
          isForEveryone: false,
          label: null,
        },
        {
          id: 'a2',
          level: null,
          groupId: 'g1',
          clientMembershipId: null,
          isForEveryone: false,
          label: 'Fuerza 50+',
        },
        {
          id: 'a3',
          level: null,
          groupId: null,
          clientMembershipId: 'm1',
          isForEveryone: false,
          label: 'Irene Castro',
        },
      ],
      WORDS,
    );

    expect(caption).toBe('Nivel: Base · Grupo: Fuerza 50+ · Cliente: Irene Castro');
  });
});
