import type { MyMembershipsResponseDtoMembershipsItem } from '@/shared/api/generated/model';

import { ALL_MODULES_ON, NO_APPEARANCE } from '@/test/factories';

import { resolveHomeDestination } from './resolve-home-destination';

function buildMembership(
  overrides: Partial<MyMembershipsResponseDtoMembershipsItem>,
): MyMembershipsResponseDtoMembershipsItem {
  return {
    membershipId: 'membership-1',
    centerId: 'center-norte',
    role: 'client',
    status: 'active',
    joinedAt: '2026-01-10T10:00:00.000Z',
    photoUrl: null,
    center: {
      name: 'Studio Norte',
      slug: 'studio-norte',
      sectorId: 'estudio',
      brandColor: '#E4572E',
      logoUrl: null,
      modules: ALL_MODULES_ON,
      appearance: NO_APPEARANCE,
    },
    ...overrides,
  };
}

describe('resolveHomeDestination', () => {
  it.each(['admin', 'accountant'] as const)(
    'sends a %s of the platform to its own zone, with or without centers',
    (platformRole) => {
      expect(
        resolveHomeDestination({ memberships: [], preferredCenterId: null, platformRole }),
      ).toEqual({ kind: 'platform', centerId: null });
      expect(
        resolveHomeDestination({
          memberships: [buildMembership({})],
          preferredCenterId: 'center-norte',
          platformRole,
        }),
      ).toEqual({ kind: 'platform', centerId: null });
    },
  );

  it('does not change anything for a person without a platform role', () => {
    expect(
      resolveHomeDestination({
        memberships: [buildMembership({ role: 'staff' })],
        preferredCenterId: null,
        platformRole: 'none',
      }),
    ).toEqual({ kind: 'staff', centerId: 'center-norte' });
  });

  it('has no destination without memberships', () => {
    expect(resolveHomeDestination({ memberships: [], preferredCenterId: null })).toEqual({
      kind: 'none',
      centerId: null,
    });
  });

  it.each([
    ['client', 'client'],
    ['staff', 'staff'],
    ['admin', 'admin'],
    ['owner', 'admin'],
  ] as const)('sends the %s role to the %s area', (role, expectedKind) => {
    const destination = resolveHomeDestination({
      memberships: [buildMembership({ role })],
      preferredCenterId: null,
    });

    expect(destination.kind).toBe(expectedKind);
  });

  it('prefers the center that is already active', () => {
    const destination = resolveHomeDestination({
      memberships: [
        buildMembership({ centerId: 'center-norte' }),
        buildMembership({ membershipId: 'membership-2', centerId: 'center-forja', role: 'staff' }),
      ],
      preferredCenterId: 'center-forja',
    });

    expect(destination).toEqual({ kind: 'staff', centerId: 'center-forja' });
  });

  it('falls back to the first active membership when the preferred center is gone', () => {
    const destination = resolveHomeDestination({
      memberships: [buildMembership({ centerId: 'center-norte' })],
      preferredCenterId: 'center-forja',
    });

    expect(destination.centerId).toBe('center-norte');
  });

  it.each(['invited', 'blocked', 'left'] as const)('ignores %s memberships', (status) => {
    const destination = resolveHomeDestination({
      memberships: [buildMembership({ status })],
      preferredCenterId: null,
    });

    expect(destination.kind).toBe('none');
  });
});
