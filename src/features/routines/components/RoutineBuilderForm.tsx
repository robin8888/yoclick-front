import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';
import { FormField } from '@/ui/molecules/FormField';

import type { RoutineBuilder } from '../hooks/useRoutineBuilder';
import { AssignTargetField } from './AssignTargetField';
import { CustomExerciseField } from './CustomExerciseField';
import { DraftExerciseRow } from './DraftExerciseRow';
import { ExerciseLibraryPicker } from './ExerciseLibraryPicker';
import { SECTION_STYLE } from './RoutinesCommon.styles';

type Builder = RoutineBuilder;

function DraftExercises({ builder }: Readonly<{ builder: Builder }>): React.JSX.Element {
  const { exercises } = builder.draft;

  return (
    <View style={SECTION_STYLE}>
      <Text variant="titleMd" role="heading">
        {i18n.t('routines.builder.exercisesTitle', { count: exercises.length })}
      </Text>
      {exercises.length === 0 ? (
        <Text color="ink2">{i18n.t('routines.builder.emptyExercises')}</Text>
      ) : null}
      {exercises.map((exercise, index) => (
        <DraftExerciseRow
          key={exercise.key}
          position={index + 1}
          exercise={exercise}
          onPrescriptionChange={(prescription) => {
            builder.changePrescription(exercise.key, prescription);
          }}
          onVideoChange={(video) => {
            builder.changeVideo(exercise.key, video);
          }}
          onRemove={() => {
            builder.removeExerciseByKey(exercise.key);
          }}
        />
      ))}
      {builder.isFull ? (
        <Text variant="caption" color="warning">
          {i18n.t('routines.builder.limitReached', { count: exercises.length })}
        </Text>
      ) : null}
    </View>
  );
}

/** El formulario de una rutina nueva: nombre, ejercicios, biblioteca y a quién se asigna. */
export function RoutineBuilderForm({ builder }: Readonly<{ builder: Builder }>): React.JSX.Element {
  return (
    <View style={SECTION_STYLE}>
      <FormField
        label={i18n.t('routines.builder.nameLabel')}
        value={builder.draft.name}
        onChangeText={builder.changeName}
        placeholder={i18n.t('routines.builder.namePlaceholder')}
        maxLength={80}
      />
      <FormField
        label={i18n.t('routines.builder.noteLabel')}
        value={builder.draft.note}
        onChangeText={builder.changeNote}
        placeholder={i18n.t('routines.builder.notePlaceholder')}
        maxLength={500}
      />
      <DraftExercises builder={builder} />
      <CustomExerciseField isDisabled={builder.isFull} onExerciseAdd={builder.addCustomExercise} />
      <ExerciseLibraryPicker
        exercises={builder.library}
        isInRoutine={builder.isInRoutine}
        onExerciseAdd={(exercise) => {
          if (!builder.isInRoutine(exercise.name) && !builder.isFull)
            builder.addLibraryExercise(exercise);
        }}
      />
      {builder.canChooseTarget ? (
        <AssignTargetField target={builder.draft.target} onTargetChange={builder.changeTarget} />
      ) : null}
    </View>
  );
}
