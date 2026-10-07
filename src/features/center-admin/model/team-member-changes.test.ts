import { buildTeamMemberChanges } from './team-member-changes';
import type { RosterMember } from './team-roster';

const MEMBER = {
  role: 'staff',
  staffTitle: 'Entrenadora',
  permissions: ['reports:view'],
} as unknown as RosterMember;

describe('buildTeamMemberChanges', () => {
  it.each([
    [
      'nothing changed',
      { role: 'staff', staffTitle: 'Entrenadora', grantedPermissions: ['reports:view'] },
      null,
    ],
    [
      'title with spaces only',
      { role: 'staff', staffTitle: ' Entrenadora ', grantedPermissions: ['reports:view'] },
      null,
    ],
    [
      'a new role',
      { role: 'admin', staffTitle: 'Entrenadora', grantedPermissions: [] },
      { role: 'admin' },
    ],
    [
      'a new title',
      { role: 'staff', staffTitle: 'Coach', grantedPermissions: ['reports:view'] },
      { staffTitle: 'Coach' },
    ],
    [
      'an emptied title',
      { role: 'staff', staffTitle: '  ', grantedPermissions: ['reports:view'] },
      { staffTitle: null },
    ],
    [
      'role and title',
      { role: 'admin', staffTitle: 'Coach', grantedPermissions: [] },
      { role: 'admin', staffTitle: 'Coach' },
    ],
    [
      'a permission given to staff',
      {
        role: 'staff',
        staffTitle: 'Entrenadora',
        grantedPermissions: ['reports:view', 'clients:manage'],
      },
      { permissions: ['reports:view', 'clients:manage'] },
    ],
    [
      'permissions are ignored when the role is administration',
      { role: 'admin', staffTitle: 'Entrenadora', grantedPermissions: ['clients:manage'] },
      { role: 'admin' },
    ],
  ] as const)('%s', (_caseName, draft, expectedChanges) => {
    expect(
      buildTeamMemberChanges(
        { ...draft, grantedPermissions: [...draft.grantedPermissions] },
        MEMBER,
      ),
    ).toEqual(expectedChanges);
  });
});
