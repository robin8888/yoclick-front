import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getApiErrorMessage } from '@/shared/api/errors';
import {
  getTeamGetAvailabilityQueryKey,
  getTeamGetAvailabilityQueryOptions,
  teamAddAbsence,
  teamRemoveAbsence,
  teamSaveAvailability,
} from '@/shared/api/generated/endpoints/team/team';
import type {
  AddedStaffAbsenceResponseDto,
  AddStaffAbsenceRequestDto,
  SaveStaffWeeklyHoursRequestDto,
  StaffAvailabilityResponseDto,
} from '@/shared/api/generated/model';

import { useActiveCenterId } from './useActiveCenterId';

export function useStaffAvailabilityQuery(
  membershipId: string,
): UseQueryResult<StaffAvailabilityResponseDto, ErrorType> {
  return useQuery(getTeamGetAvailabilityQueryOptions(useActiveCenterId(), membershipId));
}

interface StaffAvailabilityActions {
  saveWeeklyHours: (weeklyHours: SaveStaffWeeklyHoursRequestDto['weeklyHours']) => void;
  addAbsence: (absence: AddStaffAbsenceRequestDto, onAdded: () => void) => void;
  removeAbsence: (absenceId: string) => void;
  /** Cuántas citas había ya en los días de la última ausencia añadida. */
  lastAddedAbsence: AddedStaffAbsenceResponseDto | null;
  isBusy: boolean;
  errorMessage: string | null;
}

/** Guardar el horario propio y añadir o quitar ausencias; ninguna es optimista, manda el servidor. */
export function useStaffAvailabilityActions(membershipId: string): StaffAvailabilityActions {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  const refresh = (): Promise<void> =>
    queryClient.invalidateQueries({
      queryKey: getTeamGetAvailabilityQueryKey(centerId, membershipId),
    });

  const save = useMutation({
    mutationFn: (weeklyHours: SaveStaffWeeklyHoursRequestDto['weeklyHours']) =>
      teamSaveAvailability(centerId, membershipId, { weeklyHours }),
    onSuccess: refresh,
  });
  const add = useMutation({
    mutationFn: (absence: AddStaffAbsenceRequestDto) =>
      teamAddAbsence(centerId, membershipId, absence),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: (absenceId: string) => teamRemoveAbsence(centerId, membershipId, absenceId),
    onSuccess: refresh,
  });
  const failure = [save, add, remove].find((mutation) => mutation.isError)?.error;

  return {
    saveWeeklyHours: (weeklyHours) => {
      save.mutate(weeklyHours);
    },
    addAbsence: (absence, onAdded) => {
      add.mutate(absence, { onSuccess: onAdded });
    },
    removeAbsence: (absenceId) => {
      remove.mutate(absenceId);
    },
    lastAddedAbsence: add.data ?? null,
    isBusy: save.isPending || add.isPending || remove.isPending,
    errorMessage: failure ? getApiErrorMessage(failure) : null,
  };
}
