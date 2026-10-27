import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getPlatformGetChargeReportQueryOptions } from '@/shared/api/generated/endpoints/platform/platform';
import type {
  PlatformChargeReportResponseDto,
  PlatformGetChargeReportParams,
} from '@/shared/api/generated/model';

/** Lo cobrado mes a mes entre dos meses, con el total del rango: base, IVA y total. */
export function usePlatformChargeReport(
  range: PlatformGetChargeReportParams,
): UseQueryResult<PlatformChargeReportResponseDto, ErrorType> {
  return useQuery(getPlatformGetChargeReportQueryOptions(range));
}
