import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import {
  getContentGetMineQueryOptions,
  getContentListMineQueryOptions,
  getContentListQueryOptions,
} from '@/shared/api/generated/endpoints/content/content';
import type {
  ContentDetailResponseDto,
  ContentLibraryResponseDto,
  MyContentListResponseDto,
} from '@/shared/api/generated/model';

import { useActiveCenterId } from './useActiveCenterId';

/** La biblioteca del centro con a quién se enseña cada pieza (administración). */
export function useContentLibrary(): UseQueryResult<ContentLibraryResponseDto, ErrorType> {
  return useQuery(getContentListQueryOptions(useActiveCenterId()));
}

/** Lo que el centro le ha asignado al cliente. */
export function useMyContent(): UseQueryResult<MyContentListResponseDto, ErrorType> {
  return useQuery(getContentListMineQueryOptions(useActiveCenterId()));
}

/** Una pieza asignada con el enlace firmado para verla; el enlace caduca, así que se pide al abrir. */
export function useMyContentDetail(
  contentId: string,
): UseQueryResult<ContentDetailResponseDto, ErrorType> {
  return useQuery(getContentGetMineQueryOptions(useActiveCenterId(), contentId));
}
