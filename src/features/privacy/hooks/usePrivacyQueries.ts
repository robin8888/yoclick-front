import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getMeGetConsentsQueryOptions } from '@/shared/api/generated/endpoints/me/me';
import { getPrivacyListMyRequestsQueryOptions } from '@/shared/api/generated/endpoints/privacy/privacy';
import type {
  MyConsentsResponseDto,
  PrivacyRequestListResponseDto,
} from '@/shared/api/generated/model';

import { useActiveCenterId } from './useActiveCenterId';

/** El estado vigente de cada consentimiento de la persona. */
export function useMyConsents(): UseQueryResult<MyConsentsResponseDto, ErrorType> {
  return useQuery(getMeGetConsentsQueryOptions());
}

/** Lo que la persona ha pedido al centro y en qué estado está. */
export function useMyPrivacyRequests(): UseQueryResult<PrivacyRequestListResponseDto, ErrorType> {
  return useQuery(getPrivacyListMyRequestsQueryOptions(useActiveCenterId()));
}
