import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getGroupsListQueryOptions } from '@/shared/api/generated/endpoints/clients/clients';
import {
  getRoutinesGetExerciseLibraryQueryOptions,
  getRoutinesGetQueryOptions,
  getRoutinesListMineQueryOptions,
  getRoutinesListQueryOptions,
} from '@/shared/api/generated/endpoints/routines/routines';
import type {
  ExerciseLibraryResponseDto,
  GroupListResponseDto,
  MyRoutinesResponseDto,
  RoutineDetailResponseDto,
  RoutineListResponseDto,
} from '@/shared/api/generated/model';

import { useActiveCenterId } from './useActiveCenterId';

/** Los ejercicios del tipo de centro. */
export function useExerciseLibrary(): UseQueryResult<ExerciseLibraryResponseDto, ErrorType> {
  return useQuery(getRoutinesGetExerciseLibraryQueryOptions(useActiveCenterId()));
}

export function useRoutineList(): UseQueryResult<RoutineListResponseDto, ErrorType> {
  return useQuery(getRoutinesListQueryOptions(useActiveCenterId()));
}

export function useRoutineDetail(
  routineId: string,
): UseQueryResult<RoutineDetailResponseDto, ErrorType> {
  return useQuery(getRoutinesGetQueryOptions(useActiveCenterId(), routineId));
}

/** Lo que el cliente tiene asignado, directamente o por su grupo. */
export function useMyRoutines(): UseQueryResult<MyRoutinesResponseDto, ErrorType> {
  return useQuery(getRoutinesListMineQueryOptions(useActiveCenterId()));
}

export function useGroupOptions(): UseQueryResult<GroupListResponseDto, ErrorType> {
  return useQuery(getGroupsListQueryOptions(useActiveCenterId()));
}
