import type { ExerciseLibraryResponseDtoExercisesItem } from '@/shared/api/generated/model';

import {
  buildCreateRoutineRequest,
  buildUpdateRoutineRequest,
  canSaveRoutine,
  type RoutineDraft,
} from '../model/routine-draft';
import { useRoutineDraft, type RoutineDraftEditing } from './useRoutineDraft';
import { useCreateRoutine, useUpdateRoutine } from './useRoutineMutations';
import { useExerciseLibrary } from './useRoutineQueries';

export interface RoutineBuilder extends RoutineDraftEditing {
  library: readonly ExerciseLibraryResponseDtoExercisesItem[];
  canSave: boolean;
  isSaving: boolean;
  errorMessage: string | null;
  /** Al editar, a quién está asignada se cambia desde el detalle, no aquí. */
  canChooseTarget: boolean;
  addLibraryExercise: (exercise: ExerciseLibraryResponseDtoExercisesItem) => void;
  addCustomExercise: (name: string) => void;
  save: (onSaved: () => void) => void;
}

interface SaveState {
  isSaving: boolean;
  errorMessage: string | null;
  save: (draft: RoutineDraft, onSaved: () => void) => void;
}

function withLibrary(
  editing: RoutineDraftEditing,
  saving: SaveState,
  extras: { library: RoutineBuilder['library']; canChooseTarget: boolean },
): RoutineBuilder {
  return {
    ...editing,
    library: extras.library,
    canChooseTarget: extras.canChooseTarget,
    canSave: canSaveRoutine(editing.draft),
    isSaving: saving.isSaving,
    errorMessage: saving.errorMessage,
    addLibraryExercise: ({ name, category }) => {
      editing.addNamedExercise(name, category);
    },
    addCustomExercise: (name) => {
      editing.addNamedExercise(name, '');
    },
    save: (onSaved) => {
      saving.save(editing.draft, onSaved);
    },
  };
}

/** La rutina que se está armando: el borrador, la biblioteca y el guardado. */
export function useRoutineBuilder(): RoutineBuilder {
  const editing = useRoutineDraft();
  const library = useExerciseLibrary();
  const creation = useCreateRoutine();

  return withLibrary(
    editing,
    {
      isSaving: creation.isRunning,
      errorMessage: creation.errorMessage,
      save: (draft, onSaved) => {
        creation.run(buildCreateRoutineRequest(draft), onSaved);
      },
    },
    { library: library.data?.exercises ?? [], canChooseTarget: true },
  );
}

/** Una rutina guardada que se está corrigiendo: parte de su contenido y guarda con `PUT`. */
export function useRoutineEditor(routineId: string, initialDraft: RoutineDraft): RoutineBuilder {
  const editing = useRoutineDraft(initialDraft);
  const library = useExerciseLibrary();
  const update = useUpdateRoutine(routineId);

  return withLibrary(
    editing,
    {
      isSaving: update.isRunning,
      errorMessage: update.errorMessage,
      save: (draft, onSaved) => {
        update.run(buildUpdateRoutineRequest(draft), onSaved);
      },
    },
    { library: library.data?.exercises ?? [], canChooseTarget: false },
  );
}
