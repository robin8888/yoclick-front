import type { CreateRoutineRequestDto, VideoResponseDto } from '@/shared/api/generated/model';

export const MAX_ROUTINE_EXERCISES = 30;

export interface DraftExercise {
  /** Identifica la fila mientras se edita; no viaja al servidor. */
  key: string;
  name: string;
  category: string;
  prescription: string;
  /** El vídeo que muestra cómo se hace, si el plan del centro lo permite y se ha subido. */
  video: VideoResponseDto | null;
}

export type AssignmentTargetDraft =
  | { kind: 'none' }
  | { kind: 'client'; membershipId: string; name: string }
  | { kind: 'group'; groupId: string; name: string };

export interface RoutineDraft {
  name: string;
  note: string;
  exercises: DraftExercise[];
  target: AssignmentTargetDraft;
}

export const EMPTY_ROUTINE_DRAFT: RoutineDraft = {
  name: '',
  note: '',
  exercises: [],
  target: { kind: 'none' },
};

export function isExerciseInDraft(draft: RoutineDraft, exerciseName: string): boolean {
  return draft.exercises.some(({ name }) => name === exerciseName);
}

/** Añade un ejercicio al final; si el borrador ya está lleno no hace nada. */
export function addExercise(
  draft: RoutineDraft,
  exercise: { key: string; name: string; category: string },
): RoutineDraft {
  const name = exercise.name.trim();
  if (name === '' || draft.exercises.length >= MAX_ROUTINE_EXERCISES) return draft;
  return {
    ...draft,
    exercises: [...draft.exercises, { ...exercise, name, prescription: '', video: null }],
  };
}

export function removeExercise(draft: RoutineDraft, key: string): RoutineDraft {
  return { ...draft, exercises: draft.exercises.filter((exercise) => exercise.key !== key) };
}

export function setPrescription(
  draft: RoutineDraft,
  key: string,
  prescription: string,
): RoutineDraft {
  return {
    ...draft,
    exercises: draft.exercises.map((exercise) =>
      exercise.key === key ? { ...exercise, prescription } : exercise,
    ),
  };
}

export function setExerciseVideo(
  draft: RoutineDraft,
  key: string,
  video: VideoResponseDto | null,
): RoutineDraft {
  return {
    ...draft,
    exercises: draft.exercises.map((exercise) =>
      exercise.key === key ? { ...exercise, video } : exercise,
    ),
  };
}

/** El destino empieza vacío al elegir «persona» o «grupo»: hasta que se elige uno, no se puede guardar. */
export function emptyTargetOfKind(kind: AssignmentTargetDraft['kind']): AssignmentTargetDraft {
  if (kind === 'client') return { kind, membershipId: '', name: '' };
  if (kind === 'group') return { kind, groupId: '', name: '' };
  return { kind: 'none' };
}

function isTargetReady(target: AssignmentTargetDraft): boolean {
  if (target.kind === 'client') return target.membershipId !== '';
  if (target.kind === 'group') return target.groupId !== '';
  return true;
}

/** Un nombre, al menos un ejercicio y, si se quiere asignar, a quién. */
export function canSaveRoutine(draft: RoutineDraft): boolean {
  return draft.name.trim() !== '' && draft.exercises.length > 0 && isTargetReady(draft.target);
}

function buildAssignTo(target: AssignmentTargetDraft): CreateRoutineRequestDto['assignTo'] {
  if (target.kind === 'client') return { clientMembershipId: target.membershipId };
  if (target.kind === 'group') return { groupId: target.groupId };
  return undefined;
}

export function buildCreateRoutineRequest(draft: RoutineDraft): CreateRoutineRequestDto {
  const assignTo = buildAssignTo(draft.target);
  return {
    name: draft.name.trim(),
    note: draft.note.trim() === '' ? null : draft.note.trim(),
    items: draft.exercises.map(({ name, category, prescription, video }) => ({
      name,
      category: category === '' ? null : category,
      prescription: prescription.trim() === '' ? null : prescription.trim(),
      videoId: video?.id ?? null,
    })),
    ...(assignTo && { assignTo }),
  };
}
