import { buildTeamMemberChanges } from './team-member-changes';
import type { RosterMember } from './team-roster';

const MEMBER = { role: 'staff', staffTitle: 'Entrenadora' } as unknown as RosterMember;

describe('buildTeamMemberChanges', () => {
  it.each([
    ['nothing changed', { role: 'staff', staffTitle: 'Entrenadora' }, null],
    ['title with spaces only', { role: 'staff', staffTitle: ' Entrenadora ' }, null],
    ['a new role', { role: 'admin', staffTitle: 'Entrenadora' }, { role: 'admin' }],
    ['a new title', { role: 'staff', staffTitle: 'Coach' }, { staffTitle: 'Coach' }],
    ['an emptied title', { role: 'staff', staffTitle: '  ' }, { staffTitle: null }],
    [
      'role and title',
      { role: 'admin', staffTitle: 'Coach' },
      { role: 'admin', staffTitle: 'Coach' },
    ],
  ] as const)('%s', (_caseName, draft, expectedChanges) => {
    expect(buildTeamMemberChanges(draft, MEMBER)).toEqual(expectedChanges);
  });
});
