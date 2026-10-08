import { View } from 'react-native';

import { PlayableVideo } from '@/features/videos';
import type { RoutineDetailResponseDtoItemsItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Checkbox } from '@/ui/atoms/Checkbox';
import { Text } from '@/ui/atoms/Text';

import { createCardStyle, GROW_STYLE, ROW_STYLE, SECTION_STYLE } from './RoutinesCommon.styles';

/** Si se pasa, cada ejercicio se puede marcar como hecho (la pestaña «Practicar» del cliente). */
export interface ExerciseChecks {
  checkedPositions: ReadonlySet<number>;
  isDisabled: boolean;
  onToggle: (position: number) => void;
}

interface ExerciseRowProps {
  exercise: RoutineDetailResponseDtoItemsItem;
  position: number;
  checks: ExerciseChecks | undefined;
}

function ExerciseRow({
  exercise,
  position,
  checks,
}: Readonly<ExerciseRowProps>): React.JSX.Element {
  return (
    <View style={SECTION_STYLE}>
      <View accessible={checks === undefined} style={ROW_STYLE}>
        {checks === undefined ? null : (
          <Checkbox
            isChecked={checks.checkedPositions.has(position)}
            isDisabled={checks.isDisabled}
            accessibilityLabel={i18n.t('routines.progress.checkExerciseLabel', {
              exercise: exercise.name,
            })}
            onCheckedChange={() => {
              checks.onToggle(position);
            }}
          />
        )}
        <Text variant="bodyStrong" color="brandInk">
          {String(position + 1)}
        </Text>
        <View style={GROW_STYLE}>
          <Text variant="bodyStrong">{exercise.name}</Text>
          {exercise.category === null ? null : (
            <Text variant="caption" color="ink2">
              {exercise.category}
            </Text>
          )}
        </View>
        {exercise.prescription === null ? null : <Text color="ink2">{exercise.prescription}</Text>}
      </View>
      {exercise.video === null ? null : <PlayableVideo video={exercise.video} />}
    </View>
  );
}

interface ExerciseRowsProps {
  exercises: readonly RoutineDetailResponseDtoItemsItem[];
  checks?: ExerciseChecks;
}

/** Los ejercicios de una rutina, en orden, con su categoría y lo que hay que hacer. */
export function ExerciseRows({
  exercises,
  checks,
}: Readonly<ExerciseRowsProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createCardStyle(theme)}>
      {exercises.map((exercise, position) => (
        <ExerciseRow
          key={`${exercise.name}-${String(position)}`}
          exercise={exercise}
          position={position}
          checks={checks}
        />
      ))}
    </View>
  );
}
