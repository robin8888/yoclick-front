import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getPrivacyGetConsentSummaryQueryOptions } from '@/shared/api/generated/endpoints/privacy/privacy';
import type { ConsentSummaryResponseDto } from '@/shared/api/generated/model';

import { useActiveCenterId } from './useActiveCenterId';

/** Cuántos clientes han dado cada consentimiento (solo cifras). Exige sesión con segundo factor. */
export function useConsentSummary(): UseQueryResult<ConsentSummaryResponseDto, ErrorType> {
  return useQuery(getPrivacyGetConsentSummaryQueryOptions(useActiveCenterId()));
}
