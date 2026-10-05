import type {
  CenterBrandingResponseDto,
  MfaChallengeResponseDto,
  MfaLoginResponseDto,
  MyMembershipsResponseDtoMembershipsItem,
} from '@/shared/api/generated/model';

export const NORTE_CENTER_ID = '0191d6a0-0000-7000-8000-000000000001';
export const FORJA_CENTER_ID = '0191d6a0-0000-7000-8000-000000000002';

export function buildBranding(
  overrides: Partial<CenterBrandingResponseDto> = {},
): CenterBrandingResponseDto {
  return {
    centerId: NORTE_CENTER_ID,
    name: 'Studio Norte',
    sectorId: 'estudio',
    brandColor: '#E4572E',
    logoUrl: null,
    ...overrides,
  };
}

export function buildMembership(
  overrides: Partial<MyMembershipsResponseDtoMembershipsItem> = {},
): MyMembershipsResponseDtoMembershipsItem {
  return {
    membershipId: 'membership-norte',
    centerId: NORTE_CENTER_ID,
    role: 'client',
    status: 'active',
    joinedAt: '2026-01-10T10:00:00.000Z',
    center: {
      name: 'Studio Norte',
      slug: 'studio-norte',
      sectorId: 'estudio',
      brandColor: '#E4572E',
      logoUrl: null,
    },
    ...overrides,
  };
}

export function buildAuthenticatedLoginResponse(): MfaLoginResponseDto {
  return {
    status: 'authenticated',
    accessToken: 'access-token',
    accessTokenExpiresAt: '2026-10-04T10:10:00.000Z',
    refreshToken: 'refresh-token',
    refreshTokenExpiresAt: '2026-11-04T10:00:00.000Z',
    user: { id: 'user-marta', email: 'marta@correo.es', fullName: 'Marta Ruiz' },
  };
}

export function buildMfaChallengeResponse(): MfaChallengeResponseDto {
  return {
    status: 'mfa_required',
    mfaToken: 'mfa-challenge-token',
    mfaTokenExpiresAt: '2026-10-04T10:05:00.000Z',
  };
}
