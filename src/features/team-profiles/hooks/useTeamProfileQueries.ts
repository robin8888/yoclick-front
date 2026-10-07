import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import {
  getStaffReviewsListPendingQueryOptions,
  getStaffReviewsListQueryOptions,
  getTeamProfilesGetQueryOptions,
  getTeamProfilesListQueryOptions,
  getTeamSettingsGetQueryOptions,
} from '@/shared/api/generated/endpoints/team-profiles/team-profiles';
import type {
  ProfileListResponseDto,
  ProfileResponseDto,
  StaffReviewListResponseDto,
  TeamSettingsResponseDto,
} from '@/shared/api/generated/model';

import { useActiveCenterId } from './useActiveCenterId';

/** El equipo con su perfil: la clientela solo recibe los publicados. */
export function useTeamProfileList(): UseQueryResult<ProfileListResponseDto, ErrorType> {
  return useQuery(getTeamProfilesListQueryOptions(useActiveCenterId()));
}

export function useTeamProfile(
  membershipId: string,
): UseQueryResult<ProfileResponseDto, ErrorType> {
  return useQuery(getTeamProfilesGetQueryOptions(useActiveCenterId(), membershipId));
}

export function useStaffReviewList(
  membershipId: string,
): UseQueryResult<StaffReviewListResponseDto, ErrorType> {
  return useQuery(getStaffReviewsListQueryOptions(useActiveCenterId(), membershipId));
}

/** Las opiniones que esperan la revisión del centro. */
export function usePendingStaffReviews(): UseQueryResult<StaffReviewListResponseDto, ErrorType> {
  return useQuery(getStaffReviewsListPendingQueryOptions(useActiveCenterId()));
}

export function useTeamSettings(): UseQueryResult<TeamSettingsResponseDto, ErrorType> {
  return useQuery(getTeamSettingsGetQueryOptions(useActiveCenterId()));
}
