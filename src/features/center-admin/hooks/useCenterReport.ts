import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getReportsGetCenterReportQueryOptions } from '@/shared/api/generated/endpoints/reports/reports';
import type {
  CenterReportResponseDto,
  ReportsGetCenterReportPeriod,
} from '@/shared/api/generated/model';

import { useActiveCenterId } from './useActiveCenterId';

/** Los informes del centro de la última semana, mes o trimestre. */
export function useCenterReport(
  period: ReportsGetCenterReportPeriod,
): UseQueryResult<CenterReportResponseDto, ErrorType> {
  return useQuery(getReportsGetCenterReportQueryOptions(useActiveCenterId(), { period }));
}
