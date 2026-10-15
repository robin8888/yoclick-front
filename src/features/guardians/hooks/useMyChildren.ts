import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getGuardiansListMyChildrenQueryOptions } from '@/shared/api/generated/endpoints/guardians/guardians';
import type { MyChildrenResponseDto } from '@/shared/api/generated/model';
import { useSessionStore } from '@/shared/auth/session-store';

/** Las personas a cargo de quien mira (vacío si no es tutor de nadie). */
export function useMyChildren(): UseQueryResult<MyChildrenResponseDto, ErrorType> {
  const centerId = useSessionStore((state) => state.activeCenterId) ?? '';
  return useQuery(getGuardiansListMyChildrenQueryOptions(centerId));
}
