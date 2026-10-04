import { isMfaChallenge, mapLoginResponseToSessionInput } from './login-outcome';

const AUTHENTICATED_RESPONSE = {
  status: 'authenticated',
  accessToken: 'access-token',
  accessTokenExpiresAt: '2026-10-04T10:10:00.000Z',
  refreshToken: 'refresh-token',
  refreshTokenExpiresAt: '2026-11-04T10:00:00.000Z',
  user: { id: 'user-1', email: 'marta@correo.es', fullName: 'Marta Ruiz' },
} as const;

describe('isMfaChallenge', () => {
  it('recognises the second factor challenge', () => {
    expect(
      isMfaChallenge({
        status: 'mfa_required',
        mfaToken: 'mfa-token',
        mfaTokenExpiresAt: '2026-10-04T10:05:00.000Z',
      }),
    ).toBe(true);
  });

  it('does not treat an authenticated session as a challenge', () => {
    expect(isMfaChallenge(AUTHENTICATED_RESPONSE)).toBe(false);
  });
});

describe('mapLoginResponseToSessionInput', () => {
  it('keeps the tokens and the user, and drops the expiry dates', () => {
    expect(mapLoginResponseToSessionInput(AUTHENTICATED_RESPONSE)).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: { id: 'user-1', email: 'marta@correo.es', fullName: 'Marta Ruiz' },
    });
  });
});
