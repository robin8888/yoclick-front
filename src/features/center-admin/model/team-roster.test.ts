import type { RosterMember } from './team-roster';
import { isEditableTeamRole, isRosterMemberEditable, selectRosterMembers } from './team-roster';

function buildMember(role: string, status: string): RosterMember {
  return { membershipId: `${role}-${status}`, role, status } as unknown as RosterMember;
}

describe('selectRosterMembers', () => {
  it('keeps the working team and drops clients and people who left', () => {
    const members = [
      buildMember('owner', 'active'),
      buildMember('staff', 'active'),
      buildMember('staff', 'invited'),
      buildMember('staff', 'blocked'),
      buildMember('staff', 'left'),
      buildMember('client', 'active'),
    ];

    expect(selectRosterMembers(members).map((member) => member.membershipId)).toEqual([
      'owner-active',
      'staff-active',
      'staff-invited',
      'staff-blocked',
    ]);
  });
});

describe('team member editing rules', () => {
  it.each([
    ['owner', false],
    ['admin', true],
    ['staff', true],
  ])('a %s is editable: %s', (role, isExpectedEditable) => {
    expect(isRosterMemberEditable(buildMember(role, 'active'))).toBe(isExpectedEditable);
  });

  it.each([
    ['admin', true],
    ['staff', true],
    ['owner', false],
    ['client', false],
  ])('%s is an editable role: %s', (role, isExpectedEditable) => {
    expect(isEditableTeamRole(role)).toBe(isExpectedEditable);
  });
});
