import { useState } from 'react';
import { AccessibilityInfo } from 'react-native';

import { useRecordRoutineCompletion } from '@/features/routines';
import { i18n } from '@/shared/i18n';

interface RoutineChecklist {
  checkedPositions: ReadonlySet<number>;
  canRecord: boolean;
  isRecording: boolean;
  errorMessage: string | null;
  togglePosition: (position: number) => void;
  record: () => void;
}

/** Los ejercicios que la persona va marcando y el registro de «hoy hice esta rutina». */
export function useRoutineChecklist(routineId: string): RoutineChecklist {
  const [checkedPositions, setCheckedPositions] = useState<ReadonlySet<number>>(new Set());
  const recording = useRecordRoutineCompletion(routineId);

  return {
    checkedPositions,
    canRecord: checkedPositions.size > 0,
    isRecording: recording.isRunning,
    errorMessage: recording.errorMessage,
    togglePosition: (position) => {
      setCheckedPositions((current) => {
        const next = new Set(current);
        if (!next.delete(position)) next.add(position);
        return next;
      });
    },
    record: () => {
      recording.run(checkedPositions.size, () => {
        setCheckedPositions(new Set());
        AccessibilityInfo.announceForAccessibility(
          i18n.t('routines.progress.recordedAnnouncement'),
        );
      });
    },
  };
}
