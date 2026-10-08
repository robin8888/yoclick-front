import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';
import {
  getRoutinesGetQueryKey,
  getRoutinesListQueryKey,
  routinesArchive,
  routinesAssign,
  routinesCreate,
  routinesUnassign,
  routinesUpdate,
} from '@/shared/api/generated/endpoints/routines/routines';
import type {
  CreateRoutineRequestDto,
  RoutineDetailResponseDto,
  UpdateRoutineRequestDto,
} from '@/shared/api/generated/model';

import type { AssignmentTargetDraft } from '../model/routine-draft';
import { useActiveCenterId } from './useActiveCenterId';

interface RoutineMutation<TInput> {
  run: (input: TInput, onDone?: () => void) => void;
  isRunning: boolean;
  errorMessage: string | null;
}

/** `onSuccess` solo se envía si hay algo que hacer al terminar. */
function successOptions(onDone: (() => void) | undefined): { onSuccess?: () => void } {
  return onDone ? { onSuccess: onDone } : {};
}

type AssignTarget = Exclude<AssignmentTargetDraft, { kind: 'none' }>;

function toAssignmentBody(target: AssignTarget): { clientMembershipId?: string; groupId?: string } {
  return target.kind === 'client'
    ? { clientMembershipId: target.membershipId }
    : { groupId: target.groupId };
}

/** Crear, asignar, quitar la asignación y archivar; ninguna es optimista: manda el servidor. */
export function useCreateRoutine(): RoutineMutation<CreateRoutineRequestDto> & {
  created: RoutineDetailResponseDto | undefined;
} {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (request: CreateRoutineRequestDto) => routinesCreate(centerId, request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: getRoutinesListQueryKey(centerId) }),
  });

  return {
    run: (request, onDone) => {
      mutation.mutate(request, successOptions(onDone));
    },
    isRunning: mutation.isPending,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
    created: mutation.data,
  };
}

/** Guarda los cambios de una rutina; las listas y el detalle se recargan desde el servidor. */
export function useUpdateRoutine(routineId: string): RoutineMutation<UpdateRoutineRequestDto> {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (request: UpdateRoutineRequestDto) => routinesUpdate(centerId, routineId, request),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: getRoutinesGetQueryKey(centerId, routineId) }),
        queryClient.invalidateQueries({ queryKey: getRoutinesListQueryKey(centerId) }),
      ]),
  });

  return {
    run: (request, onDone) => {
      mutation.mutate(request, successOptions(onDone));
    },
    isRunning: mutation.isPending,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
  };
}

export function useAssignRoutine(routineId: string): RoutineMutation<AssignTarget> {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (target: AssignTarget) =>
      routinesAssign(centerId, routineId, toAssignmentBody(target)),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: getRoutinesGetQueryKey(centerId, routineId) }),
        queryClient.invalidateQueries({ queryKey: getRoutinesListQueryKey(centerId) }),
      ]),
  });

  return {
    run: (target, onDone) => {
      mutation.mutate(target, successOptions(onDone));
    },
    isRunning: mutation.isPending,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
  };
}

export function useUnassignRoutine(routineId: string): RoutineMutation<string> {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (assignmentId: string) => routinesUnassign(centerId, routineId, assignmentId),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: getRoutinesGetQueryKey(centerId, routineId) }),
        queryClient.invalidateQueries({ queryKey: getRoutinesListQueryKey(centerId) }),
      ]),
  });

  return {
    run: (assignmentId, onDone) => {
      mutation.mutate(assignmentId, successOptions(onDone));
    },
    isRunning: mutation.isPending,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
  };
}

export function useArchiveRoutine(routineId: string): RoutineMutation<undefined> {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => routinesArchive(centerId, routineId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: getRoutinesListQueryKey(centerId) }),
  });

  return {
    run: (_input, onDone) => {
      mutation.mutate(undefined, successOptions(onDone));
    },
    isRunning: mutation.isPending,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
  };
}
