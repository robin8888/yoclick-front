import { View } from 'react-native';

import { useVideoPlan, VideoUploadField } from '@/features/videos';
import type { VideoResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { IconButton } from '@/ui/atoms/IconButton';
import { Input } from '@/ui/atoms/Input';
import { Text } from '@/ui/atoms/Text';

import type { DraftExercise } from '../model/routine-draft';
import { createCardStyle, GROW_STYLE, ROW_STYLE } from './RoutinesCommon.styles';

interface DraftExerciseHeaderProps {
  position: number;
  exercise: DraftExercise;
  onRemove: () => void;
}

function DraftExerciseHeader({
  position,
  exercise,
  onRemove,
}: Readonly<DraftExerciseHeaderProps>): React.JSX.Element {
  return (
    <View style={ROW_STYLE}>
      <Text variant="bodyStrong" color="brandInk">
        {String(position)}
      </Text>
      <View style={GROW_STYLE}>
        <Text variant="bodyStrong">{exercise.name}</Text>
        {exercise.category === '' ? null : (
          <Text variant="caption" color="ink2">
            {exercise.category}
          </Text>
        )}
      </View>
      <IconButton
        iconName="close"
        variant="tonal"
        accessibilityLabel={i18n.t('routines.builder.removeExerciseLabel', {
          exercise: exercise.name,
        })}
        onPress={onRemove}
      />
    </View>
  );
}

interface DraftExerciseRowProps {
  position: number;
  exercise: DraftExercise;
  onPrescriptionChange: (prescription: string) => void;
  onVideoChange: (video: VideoResponseDto | null) => void;
  onRemove: () => void;
}

/** Un ejercicio de la rutina que se está armando: lo que hay que hacer y quitarlo. */
export function DraftExerciseRow({
  position,
  exercise,
  onPrescriptionChange,
  onVideoChange,
  onRemove,
}: Readonly<DraftExerciseRowProps>): React.JSX.Element {
  const theme = useTheme();
  const canAddVideo = useVideoPlan().data?.isIncluded === true;

  return (
    <View style={createCardStyle(theme)}>
      <DraftExerciseHeader position={position} exercise={exercise} onRemove={onRemove} />
      <Input
        value={exercise.prescription}
        onChangeText={onPrescriptionChange}
        accessibilityLabel={i18n.t('routines.builder.prescriptionLabel', {
          exercise: exercise.name,
        })}
        placeholder={i18n.t('routines.builder.prescriptionPlaceholder')}
        maxLength={120}
      />
      {canAddVideo ? (
        <VideoUploadField
          purpose="exercise"
          video={exercise.video}
          onVideoChange={onVideoChange}
          accessibilityName={exercise.name}
        />
      ) : null}
    </View>
  );
}
