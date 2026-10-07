import { View } from 'react-native';

import { PlayableVideo } from '@/features/videos';
import type { RoutineDetailResponseDtoItemsItem } from '@/shared/api/generated/model';
import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import { createCardStyle, GROW_STYLE, ROW_STYLE, SECTION_STYLE } from './RoutinesCommon.styles';

interface ExerciseRowsProps {
  exercises: readonly RoutineDetailResponseDtoItemsItem[];
}

/** Los ejercicios de una rutina, en orden, con su categoría y lo que hay que hacer. */
export function ExerciseRows({ exercises }: Readonly<ExerciseRowsProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createCardStyle(theme)}>
      {exercises.map((exercise, index) => (
        <View key={`${exercise.name}-${String(index)}`} style={SECTION_STYLE}>
          <View accessible style={ROW_STYLE}>
            <Text variant="bodyStrong" color="brandInk">
              {String(index + 1)}
            </Text>
            <View style={GROW_STYLE}>
              <Text variant="bodyStrong">{exercise.name}</Text>
              {exercise.category === null ? null : (
                <Text variant="caption" color="ink2">
                  {exercise.category}
                </Text>
              )}
            </View>
            {exercise.prescription === null ? null : (
              <Text color="ink2">{exercise.prescription}</Text>
            )}
          </View>
          {exercise.video === null ? null : <PlayableVideo video={exercise.video} />}
        </View>
      ))}
    </View>
  );
}
