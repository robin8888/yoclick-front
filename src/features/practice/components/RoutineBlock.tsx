import { View } from 'react-native';

import { ExerciseRows } from '@/features/routines';
import type { MyRoutinesResponseDtoRoutinesItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { formatNumericDate } from '@/shared/lib/format';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';

import { useRoutineChecklist } from '../hooks/useRoutineChecklist';

const ISO_DATE_LENGTH = 10;
const ROUTINE_STYLE = { gap: 8 } as const;

interface RecordFooterProps {
  isCompletedToday: boolean;
  checklist: ReturnType<typeof useRoutineChecklist>;
}

function RecordFooter({
  isCompletedToday,
  checklist,
}: Readonly<RecordFooterProps>): React.JSX.Element {
  if (isCompletedToday) {
    return <Text color="success">{i18n.t('routines.progress.alreadyDoneToday')}</Text>;
  }
  return (
    <Button
      label={i18n.t('routines.progress.doneTodayAction')}
      isFullWidth
      isDisabled={!checklist.canRecord}
      isLoading={checklist.isRecording}
      onPress={checklist.record}
    />
  );
}

/** Una rutina asignada: sus ejercicios con marcas, cuántas veces la ha hecho y «Hoy hice esta rutina». */
export function RoutineBlock({
  routine,
}: Readonly<{ routine: MyRoutinesResponseDtoRoutinesItem }>): React.JSX.Element {
  const checklist = useRoutineChecklist(routine.id);
  const { isCompletedToday, completionCount } = routine.progress;
  const receivedOn = formatNumericDate(routine.assignedAt.slice(0, ISO_DATE_LENGTH));

  return (
    <View style={ROUTINE_STYLE}>
      <Text variant="titleMd" role="heading">
        {routine.name}
      </Text>
      <Text variant="caption" color="ink2">
        {i18n.t('routines.client.assignedOn', { date: receivedOn })}
      </Text>
      <Text variant="caption" color="ink2">
        {i18n.t('routines.progress.timesDone', { count: completionCount })}
      </Text>
      {routine.note === null ? null : <Text color="ink2">{routine.note}</Text>}
      <ExerciseRows
        exercises={routine.items}
        checks={{
          checkedPositions: checklist.checkedPositions,
          isDisabled: isCompletedToday || checklist.isRecording,
          onToggle: checklist.togglePosition,
        }}
      />
      <RecordFooter isCompletedToday={isCompletedToday} checklist={checklist} />
      {checklist.errorMessage === null ? null : (
        <FormErrorBanner message={checklist.errorMessage} />
      )}
    </View>
  );
}
