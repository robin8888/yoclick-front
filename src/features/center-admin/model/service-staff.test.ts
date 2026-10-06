import type { TeamResponseDtoMembersItem } from '@/shared/api/generated/model';

import { selectAssignableStaff, toggleStaffSelection } from './service-staff';

function buildMember(overrides: Partial<TeamResponseDtoMembersItem>): TeamResponseDtoMembersItem {
  return {
    membershipId: 'member-1',
    userId: 'user-1',
    fullName: 'Álex Moreno',
    email: 'alex@example.com',
    role: 'staff',
    status: 'active',
    staffTitle: null,
    permissions: [],
    joinedAt: '2026-01-01T09:00:00.000Z',
    ...overrides,
  };
}

describe('selectAssignableStaff', () => {
  it.each([
    { role: 'owner', status: 'active', isAssignable: true },
    { role: 'admin', status: 'active', isAssignable: true },
    { role: 'staff', status: 'active', isAssignable: true },
    { role: 'client', status: 'active', isAssignable: false },
    { role: 'staff', status: 'invited', isAssignable: false },
    { role: 'staff', status: 'blocked', isAssignable: false },
    { role: 'staff', status: 'left', isAssignable: false },
  ] as const)('a $role who is $status is assignable: $isAssignable', (member) => {
    const assignable = selectAssignableStaff([
      buildMember({ role: member.role, status: member.status }),
    ]);

    expect(assignable).toHaveLength(member.isAssignable ? 1 : 0);
  });

  it('keeps only what the form needs from each person', () => {
    const [staffMember] = selectAssignableStaff([buildMember({ staffTitle: 'Entrenador' })]);

    expect(staffMember).toEqual({
      membershipId: 'member-1',
      fullName: 'Álex Moreno',
      staffTitle: 'Entrenador',
    });
  });
});

describe('toggleStaffSelection', () => {
  it.each([
    { selected: [], toggled: 'a', expected: ['a'] },
    { selected: ['a'], toggled: 'b', expected: ['a', 'b'] },
    { selected: ['a', 'b'], toggled: 'a', expected: ['b'] },
    { selected: ['a'], toggled: 'a', expected: [] },
  ])('toggling $toggled in $selected gives $expected', ({ selected, toggled, expected }) => {
    expect(toggleStaffSelection(selected, toggled)).toEqual(expected);
  });
});
