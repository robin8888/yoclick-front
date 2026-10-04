import type { MfaChallengeResponseDto, MfaLoginResponseDto } from '@/shared/api/generated/model';
import type { StartSessionInput } from '@/shared/auth/session-services';

export type LoginResponse = MfaLoginResponseDto | MfaChallengeResponseDto;

export function isMfaChallenge(response: LoginResponse): response is MfaChallengeResponseDto {
  return response.status === 'mfa_required';
}

/** Solo lo que la sesión necesita: las fechas de caducidad las vuelve a dar el refresh. */
export function mapLoginResponseToSessionInput(response: MfaLoginResponseDto): StartSessionInput {
  return {
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    user: { id: response.user.id, email: response.user.email, fullName: response.user.fullName },
  };
}
