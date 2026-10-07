import type { ExerciseLibraryResponseDtoExercisesItem } from '@/shared/api/generated/model';

import { buildCreateRoutineRequest, canSaveRoutine } from '../model/routine-draft';
import { useRoutineDraft, type RoutineDraftEditing } from './useRoutineDraft';
import { useCreateRoutine } from './useRoutineMutations';
import { useExerciseLibrary } from './useRoutineQueries';

interface RoutineBuilder extends RoutineDraftEditing {
  library: readonly ExerciseLibraryResponseDtoExercisesItem[];
  canSave: boolean;
  isSaving: boolean;
  errorMessage: string | null;
  addLibraryExercise: (exercise: ExerciseLibraryResponseDtoExercisesItem) => void;
  addCustomExercise: (name: string) => void;
  save: (onSaved: () => void) => void;
}

/** La rutina que se está armando: el borrador, la biblioteca y el guardado. */
export function useRoutineBuilder(): RoutineBuilder {
  const editing = useRoutineDraft();
  const library = useExerciseLibrary();
  const creation = useCreateRoutine();

  return {
    ...editing,
    library: library.data?.exercises ?? [],
    canSave: canSaveRoutine(editing.draft),
    isSaving: creation.isRunning,
    errorMessage: creation.errorMessage,
    addLibraryExercise: ({ name, category }) => {
      editing.addNamedExercise(name, category);
    },
    addCustomExercise: (name) => {
      editing.addNamedExercise(name, '');
    },
    save: (onSaved) => {
      creation.run(buildCreateRoutineRequest(editing.draft), onSaved);
    },
  };
}
