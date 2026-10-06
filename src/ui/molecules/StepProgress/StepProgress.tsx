import { View } from 'react-native';

import { useTheme } from '@/shared/theme';

import { createStepSegmentStyle, createStepsRowStyle } from './StepProgress.styles';
import type { StepProgressProps } from './StepProgress.types';

/** Barras de progreso de un asistente por pasos; las del paso actual y anteriores van rellenas. */
export function StepProgress({
  currentStep,
  stepCount,
  accessibilityLabel,
}: Readonly<StepProgressProps>): React.JSX.Element {
  const theme = useTheme();
  const stepNumbers = Array.from({ length: stepCount }, (_, index) => index + 1);

  return (
    <View
      accessible
      role="progressbar"
      aria-label={accessibilityLabel}
      aria-valuemin={1}
      aria-valuemax={stepCount}
      aria-valuenow={currentStep}
      style={createStepsRowStyle(theme)}
    >
      {stepNumbers.map((stepNumber) => (
        <View key={stepNumber} style={createStepSegmentStyle(theme, stepNumber <= currentStep)} />
      ))}
    </View>
  );
}
