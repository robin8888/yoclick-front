import { useRef, useState } from 'react';

import type { VideoResponseDto } from '@/shared/api/generated/model';

import {
  addExercise,
  EMPTY_ROUTINE_DRAFT,
  isExerciseInDraft,
  MAX_ROUTINE_EXERCISES,
  removeExercise,
  setExerciseVideo,
  setPrescription,
  type AssignmentTargetDraft,
  type RoutineDraft,
} from '../model/routine-draft';

export interface RoutineDraftEditing {
  draft: RoutineDraft;
  isFull: boolean;
  changeName: (name: string) => void;
  changeNote: (note: string) => void;
  /** Añade un ejercicio al final (de la biblioteca si trae categoría, o uno propio). */
  addNamedExercise: (name: string, category: string) => void;
  isInRoutine: (exerciseName: string) => boolean;
  removeExerciseByKey: (key: string) => void;
  changePrescription: (key: string, prescription: string) => void;
  changeVideo: (key: string, video: VideoResponseDto | null) => void;
  changeTarget: (target: AssignmentTargetDraft) => void;
}

/** El borrador de la rutina y las formas de cambiarlo. */
export function useRoutineDraft(): RoutineDraftEditing {
  const [draft, setDraft] = useState<RoutineDraft>(EMPTY_ROUTINE_DRAFT);
  const nextKey = useRef(0);

  return {
    draft,
    isFull: draft.exercises.length >= MAX_ROUTINE_EXERCISES,
    changeName: (name) => {
      setDraft((current) => ({ ...current, name }));
    },
    changeNote: (note) => {
      setDraft((current) => ({ ...current, note }));
    },
    addNamedExercise: (name, category) => {
      nextKey.current += 1;
      const key = `exercise-${String(nextKey.current)}`;
      setDraft((current) => addExercise(current, { key, name, category }));
    },
    isInRoutine: (exerciseName) => isExerciseInDraft(draft, exerciseName),
    removeExerciseByKey: (key) => {
      setDraft((current) => removeExercise(current, key));
    },
    changePrescription: (key, prescription) => {
      setDraft((current) => setPrescription(current, key, prescription));
    },
    changeVideo: (key, video) => {
      setDraft((current) => setExerciseVideo(current, key, video));
    },
    changeTarget: (target) => {
      setDraft((current) => ({ ...current, target }));
    },
  };
}
