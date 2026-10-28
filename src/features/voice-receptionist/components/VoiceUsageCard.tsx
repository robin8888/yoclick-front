import { View } from 'react-native';

import type { VoiceOverviewResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Badge, type BadgeTone } from '@/ui/atoms/Badge';
import { Text } from '@/ui/atoms/Text';

import {
  clampBarPercent,
  resolveVoiceUsageLevel,
  type VoiceUsageLevel,
} from '../model/voice-usage';
import {
  createVoiceBarFillStyle,
  createVoiceBarGapStyle,
  createVoiceBarTrackStyle,
  createVoiceCardStyle,
} from './VoiceCard.styles';

const FULL_PERCENT = 100;

const LEVEL_TONES: Record<VoiceUsageLevel, BadgeTone> = {
  normal: 'success',
  near_limit: 'warning',
  limit_reached: 'danger',
};

function UsageBar({ usedPercent }: Readonly<{ usedPercent: number }>): React.JSX.Element {
  const theme = useTheme();
  const barPercent = clampBarPercent(usedPercent);

  return (
    <View
      style={createVoiceBarTrackStyle(theme)}
      role="progressbar"
      accessibilityLabel={i18n.t('voiceReceptionist.usage.barA11y', {
        percent: Math.round(usedPercent),
      })}
      accessibilityValue={{ min: 0, max: FULL_PERCENT, now: Math.round(barPercent) }}
    >
      <View style={createVoiceBarFillStyle(theme, barPercent)} />
      <View style={createVoiceBarGapStyle(barPercent)} />
    </View>
  );
}

/** Minutos usados frente a los incluidos; el estado se dice con palabras, no solo con el color. */
export function VoiceUsageCard({
  overview,
}: Readonly<{ overview: VoiceOverviewResponseDto }>): React.JSX.Element | null {
  const theme = useTheme();
  const { usage } = overview;
  if (usage === null) return null;

  const level = resolveVoiceUsageLevel(usage.usedPercent);
  const afterLimitPolicy = overview.config?.overagePolicy ?? 'continue_and_charge';

  return (
    <View style={createVoiceCardStyle(theme)}>
      <Text variant="titleMd" role="heading">
        {i18n.t('voiceReceptionist.usage.title')}
      </Text>
      <Text variant="bodyStrong">
        {i18n.t('voiceReceptionist.usage.summary', {
          used: usage.usedMinutes,
          included: usage.includedMinutes,
        })}
      </Text>
      <UsageBar usedPercent={usage.usedPercent} />
      <View>
        <Badge
          label={i18n.t(`voiceReceptionist.usage.levels.${level}`)}
          tone={LEVEL_TONES[level]}
        />
      </View>
      {usage.overageMinutes > 0 ? (
        <Text color="ink2">
          {i18n.t('voiceReceptionist.usage.overage', { count: usage.overageMinutes })}
        </Text>
      ) : null}
      {level === 'limit_reached' ? (
        <Text color="ink2">{i18n.t(`voiceReceptionist.usage.afterLimit.${afterLimitPolicy}`)}</Text>
      ) : null}
    </View>
  );
}
