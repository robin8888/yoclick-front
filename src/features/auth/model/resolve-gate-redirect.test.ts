import { resolveSignedInGateRedirect } from './resolve-gate-redirect';
import type { HomeDestination } from './resolve-home-destination';

const NO_CENTER: HomeDestination = { kind: 'none', centerId: null };
const ADMIN_OF_A_CENTER: HomeDestination = { kind: 'admin', centerId: 'center-1' };
const NO_INTENT = {
  hasInvitationLink: false,
  isInvitationExpected: false,
  isCenterCreationRequested: false,
} as const;

describe('resolveSignedInGateRedirect', () => {
  it.each([
    {
      caseName: 'an invitation link, even with centers',
      destination: ADMIN_OF_A_CENTER,
      intent: { hasInvitationLink: true },
      expectedRedirect: '/join/invitation',
    },
    {
      caseName: 'an invitation link while centers load',
      destination: null,
      intent: { hasInvitationLink: true },
      expectedRedirect: '/join/invitation',
    },
    {
      caseName: 'an owner without centers',
      destination: NO_CENTER,
      intent: { isCenterCreationRequested: true },
      expectedRedirect: '/(onboarding)/center',
    },
    {
      caseName: 'an instructor without centers',
      destination: NO_CENTER,
      intent: { isInvitationExpected: true },
      expectedRedirect: '/join/invitation',
    },
    {
      caseName: 'an owner who already has a center',
      destination: ADMIN_OF_A_CENTER,
      intent: { isCenterCreationRequested: true },
      expectedRedirect: null,
    },
    {
      caseName: 'an instructor who already has a center',
      destination: ADMIN_OF_A_CENTER,
      intent: { isInvitationExpected: true },
      expectedRedirect: null,
    },
    {
      caseName: 'a student without centers',
      destination: NO_CENTER,
      intent: {},
      expectedRedirect: null,
    },
    {
      caseName: 'centers still loading',
      destination: null,
      intent: { isCenterCreationRequested: true },
      expectedRedirect: null,
    },
  ] as const)('handles $caseName', ({ destination, intent, expectedRedirect }) => {
    expect(resolveSignedInGateRedirect({ destination, ...NO_INTENT, ...intent })).toBe(
      expectedRedirect,
    );
  });
});
