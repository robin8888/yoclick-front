import {
  getStaffReviewsListPendingQueryKey,
  getStaffReviewsListQueryKey,
  getTeamProfilesGetQueryKey,
  getTeamProfilesListQueryKey,
  getTeamSettingsGetQueryKey,
  staffReviewsCreate,
  staffReviewsModerate,
  teamProfilesAddCertification,
  teamProfilesRemoveCertification,
  teamProfilesReview,
  teamProfilesSaveMine,
  teamProfilesSubmitMine,
  teamProfilesVerifyCertification,
  teamSettingsSave,
} from '@/shared/api/generated/endpoints/team-profiles/team-profiles';
import type {
  AddCertificationRequestDto,
  CreateReviewRequestDto,
  SaveProfileRequestDto,
  StaffReviewResponseDto,
  TeamSettingsRequestDto,
} from '@/shared/api/generated/model';

import { useActiveCenterId } from './useActiveCenterId';
import { useInvalidatingMutation, type ApiMutation } from './useInvalidatingMutation';

/** Guardar lo escrito; el perfil vuelve a borrador hasta enviarlo a revisión. */
export function useSaveMyProfile(): ApiMutation<SaveProfileRequestDto> {
  const centerId = useActiveCenterId();
  return useInvalidatingMutation({
    send: (request: SaveProfileRequestDto) => teamProfilesSaveMine(centerId, request),
    invalidates: [getTeamProfilesListQueryKey(centerId)],
  });
}

export function useSubmitMyProfile(): ApiMutation<void> {
  const centerId = useActiveCenterId();
  return useInvalidatingMutation({
    send: () => teamProfilesSubmitMine(centerId),
    invalidates: [getTeamProfilesListQueryKey(centerId)],
  });
}

export function useAddCertification(): ApiMutation<AddCertificationRequestDto> {
  const centerId = useActiveCenterId();
  return useInvalidatingMutation({
    send: (request: AddCertificationRequestDto) => teamProfilesAddCertification(centerId, request),
    invalidates: [getTeamProfilesListQueryKey(centerId)],
  });
}

export function useRemoveCertification(): ApiMutation<string> {
  const centerId = useActiveCenterId();
  return useInvalidatingMutation({
    send: (certificationId: string) => teamProfilesRemoveCertification(centerId, certificationId),
    invalidates: [getTeamProfilesListQueryKey(centerId)],
  });
}

export interface ProfileReviewDecision {
  membershipId: string;
  isApproved: boolean;
  note?: string;
}

/** La administración aprueba y publica, o pide cambios con una nota. */
export function useReviewProfile(): ApiMutation<ProfileReviewDecision> {
  const centerId = useActiveCenterId();
  return useInvalidatingMutation({
    send: ({ membershipId, isApproved, note }: ProfileReviewDecision) =>
      teamProfilesReview(centerId, membershipId, {
        decision: isApproved ? 'approve' : 'request_changes',
        ...(note !== undefined && { note }),
      }),
    invalidates: [getTeamProfilesListQueryKey(centerId)],
  });
}

export function useVerifyCertification(): ApiMutation<{
  membershipId: string;
  certificationId: string;
}> {
  const centerId = useActiveCenterId();
  return useInvalidatingMutation({
    send: ({ membershipId, certificationId }: { membershipId: string; certificationId: string }) =>
      teamProfilesVerifyCertification(centerId, membershipId, certificationId),
    invalidates: [getTeamProfilesListQueryKey(centerId)],
  });
}

export function useSaveTeamSettings(): ApiMutation<TeamSettingsRequestDto> {
  const centerId = useActiveCenterId();
  return useInvalidatingMutation({
    send: (settings: TeamSettingsRequestDto) => teamSettingsSave(centerId, settings),
    invalidates: [getTeamSettingsGetQueryKey(centerId)],
  });
}

/** Opinar de una sesión que se tuvo con esa persona: de 1 a 5, con un comentario opcional. */
export function useCreateStaffReview(
  membershipId: string,
): ApiMutation<CreateReviewRequestDto, StaffReviewResponseDto> {
  const centerId = useActiveCenterId();
  return useInvalidatingMutation({
    send: (review: CreateReviewRequestDto) => staffReviewsCreate(centerId, membershipId, review),
    invalidates: [
      getStaffReviewsListQueryKey(centerId, membershipId),
      getTeamProfilesGetQueryKey(centerId, membershipId),
    ],
  });
}

export function useModerateStaffReview(): ApiMutation<{ reviewId: string; isApproved: boolean }> {
  const centerId = useActiveCenterId();
  return useInvalidatingMutation({
    send: ({ reviewId, isApproved }: { reviewId: string; isApproved: boolean }) =>
      staffReviewsModerate(centerId, reviewId, { decision: isApproved ? 'approve' : 'reject' }),
    invalidates: [
      getStaffReviewsListPendingQueryKey(centerId),
      getTeamProfilesListQueryKey(centerId),
    ],
  });
}
