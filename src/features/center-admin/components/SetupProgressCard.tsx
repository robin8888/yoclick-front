import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { useActiveCenterSectorId } from '@/features/join';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { motionTokens, usePressableStyle, useTheme } from '@/shared/theme';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';
import { StepProgress } from '@/ui/molecules/StepProgress';

import { useSetupProgress } from '../hooks/useSetupProgress';
import type { SetupGuideStep } from '../model/setup-guide-steps';
import {
  createProgressCardStyle,
  createProgressHeaderStyle,
  createProgressTextStyle,
} from './SetupProgressCard.styles';

interface ProgressSummaryProps {
  counts: { done: number; total: number };
  next: string;
}

function ProgressSummary({ counts, next }: Readonly<ProgressSummaryProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createProgressHeaderStyle(theme)}>
      <View style={createProgressTextStyle(theme)}>
        <Text variant="bodyStrong">{i18n.t('centerAdmin.setupGuide.progressTitle', counts)}</Text>
        <Text variant="caption" color="ink2">
          {i18n.t('centerAdmin.setupGuide.progressNext', { next })}
        </Text>
      </View>
      <Icon name="chevronRight" color="ink2" />
    </View>
  );
}

interface ProgressCardBodyProps {
  doneCount: number;
  totalCount: number;
  nextStep: SetupGuideStep;
}

function ProgressCardBody({
  doneCount,
  totalCount,
  nextStep,
}: Readonly<ProgressCardBodyProps>): React.JSX.Element {
  const router = useRouter();
  const theme = useTheme();
  const { client, staff } = getSectorVocabulary(useActiveCenterSectorId());
  const style = usePressableStyle({
    baseStyle: createProgressCardStyle(theme),
    pressedScale: motionTokens.pressScaleButton,
    isEnabled: true,
  });
  const counts = { done: doneCount, total: totalCount };
  const next = i18n.t(`centerAdmin.setupGuide.steps.${nextStep.id}.title`, {
    clientWord: client.plural,
    clientSingular: client.singular,
    staffWord: staff.plural,
  });

  return (
    <Pressable
      role="button"
      accessibilityLabel={i18n.t('centerAdmin.setupGuide.progressLabel', { ...counts, next })}
      onPress={() => {
        router.push(nextStep.route);
      }}
      style={style}
    >
      <ProgressSummary counts={counts} next={next} />
      <StepProgress
        currentStep={doneCount}
        stepCount={totalCount}
        accessibilityLabel={i18n.t('centerAdmin.setupGuide.progressTitle', counts)}
      />
    </Pressable>
  );
}

/**
 * El avance de «Primeros pasos» en el inicio del centro: cuántos pasos lleva hechos y cuál toca.
 * Desaparece cuando ya está todo, y mientras no se sepa no ocupa sitio.
 */
export function SetupProgressCard(): React.JSX.Element | null {
  const progress = useSetupProgress();

  if (progress?.nextStep === undefined) return null;

  return (
    <ProgressCardBody
      doneCount={progress.doneCount}
      totalCount={progress.totalCount}
      nextStep={progress.nextStep}
    />
  );
}
