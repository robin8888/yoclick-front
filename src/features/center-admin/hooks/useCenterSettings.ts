import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getCentersGetSettingsQueryOptions } from '@/shared/api/generated/endpoints/centers/centers';
import type { CenterSettingsResponseDto } from '@/shared/api/generated/model';

import { useActiveCenterId } from './useActiveCenterId';

/** Ajustes del centro (horario, dirección, código para unirse). Exige sesión con MFA. */
export function useCenterSettings(): UseQueryResult<CenterSettingsResponseDto, ErrorType> {
  return useQuery(getCentersGetSettingsQueryOptions(useActiveCenterId()));
}
