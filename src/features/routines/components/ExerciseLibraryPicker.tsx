import { useState } from 'react';
import { Pressable, View } from 'react-native';

import type { ExerciseLibraryResponseDtoExercisesItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import { listLibraryCategories } from '../model/exercise-library';
import {
  CHIPS_STYLE,
  createChipStyle,
  createLibraryRowStyle,
  GROW_STYLE,
  SECTION_STYLE,
} from './RoutinesCommon.styles';

type LibraryExercise = ExerciseLibraryResponseDtoExercisesItem;

interface CategoryChipsProps {
  categories: readonly string[];
  selectedCategory: string | null;
  onSelect: (category: string | null) => void;
}

function CategoryChips({
  categories,
  selectedCategory,
  onSelect,
}: Readonly<CategoryChipsProps>): React.JSX.Element {
  const theme = useTheme();
  const options = [null, ...categories];

  return (
    <View role="radiogroup" style={CHIPS_STYLE}>
      {options.map((category) => (
        <Pressable
          key={category ?? 'all'}
          role="radio"
          accessibilityState={{ checked: category === selectedCategory }}
          onPress={() => {
            onSelect(category);
          }}
          style={createChipStyle(theme, category === selectedCategory)}
        >
          <Text variant="caption" color={category === selectedCategory ? 'brandInk' : 'ink'}>
            {category ?? i18n.t('routines.builder.allCategories')}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

interface LibraryRowProps {
  exercise: LibraryExercise;
  isAdded: boolean;
  onPress: () => void;
}

function LibraryRow({ exercise, isAdded, onPress }: Readonly<LibraryRowProps>): React.JSX.Element {
  const theme = useTheme();
  const labelKey = isAdded ? 'routines.builder.inRoutine' : 'routines.builder.addFromLibrary';

  return (
    <Pressable
      role="button"
      accessibilityLabel={i18n.t(labelKey, { exercise: exercise.name })}
      accessibilityState={{ disabled: isAdded }}
      onPress={onPress}
      style={createLibraryRowStyle(theme)}
    >
      <View style={GROW_STYLE}>
        <Text variant="bodyStrong">{exercise.name}</Text>
        <Text variant="caption" color="ink2">
          {exercise.category}
        </Text>
      </View>
      <Icon name={isAdded ? 'check' : 'plus'} color={isAdded ? 'success' : 'brandInk'} />
    </Pressable>
  );
}

interface ExerciseLibraryPickerProps {
  exercises: readonly LibraryExercise[];
  isInRoutine: (exerciseName: string) => boolean;
  onExerciseAdd: (exercise: LibraryExercise) => void;
}

/** La biblioteca del tipo de centro: se filtra por categoría y se añade con un toque. */
export function ExerciseLibraryPicker({
  exercises,
  isInRoutine,
  onExerciseAdd,
}: Readonly<ExerciseLibraryPickerProps>): React.JSX.Element {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const visibleExercises = exercises.filter(
    ({ category }) => selectedCategory === null || category === selectedCategory,
  );

  return (
    <View style={SECTION_STYLE}>
      <Text variant="titleMd" role="heading">
        {i18n.t('routines.builder.libraryTitle')}
      </Text>
      <CategoryChips
        categories={listLibraryCategories(exercises)}
        selectedCategory={selectedCategory}
        onSelect={setSelectedCategory}
      />
      {visibleExercises.map((exercise) => (
        <LibraryRow
          key={exercise.name}
          exercise={exercise}
          isAdded={isInRoutine(exercise.name)}
          onPress={() => {
            onExerciseAdd(exercise);
          }}
        />
      ))}
    </View>
  );
}
