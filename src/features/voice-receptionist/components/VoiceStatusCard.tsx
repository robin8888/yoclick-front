import { View } from 'react-native';

import type { VoiceOverviewResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Badge, type BadgeTone } from '@/ui/atoms/Badge';
import { Switch } from '@/ui/atoms/Switch';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';

import { useToggleVoiceReceptionist } from '../hooks/useToggleVoiceReceptionist';
import {
  canToggleVoiceReceptionist,
  resolveVoiceServiceState,
  type VoiceServiceState,
} from '../model/voice-service-state';
import {
  createVoiceCardStyle,
  createVoiceRowStyle,
  VOICE_FLEX_TEXT_STYLE,
} from './VoiceCard.styles';

const STATE_TONES: Record<Exclude<VoiceServiceState, 'not_contracted'>, BadgeTone> = {
  active: 'success',
  inactive: 'neutral',
  paused: 'warning',
  cancelled: 'neutral',
};

function describeState(
  state: Exclude<VoiceServiceState, 'not_contracted'>,
  hasLine: boolean,
): string {
  if (state === 'inactive' && !hasLine) return i18n.t('voiceReceptionist.status.noLineDescription');
  return i18n.t(`voiceReceptionist.status.${state}Description`);
}

/** Si el servicio atiende o no, y el interruptor para encenderlo o apagarlo. */
export function VoiceStatusCard({
  overview,
}: Readonly<{ overview: VoiceOverviewResponseDto }>): React.JSX.Element | null {
  const theme = useTheme();
  const switching = useToggleVoiceReceptionist();
  const state = resolveVoiceServiceState(overview);
  if (state === 'not_contracted') return null;

  return (
    <View style={createVoiceCardStyle(theme)}>
      <Text variant="titleMd" role="heading">
        {i18n.t('voiceReceptionist.status.title')}
      </Text>
      <View style={createVoiceRowStyle(theme)}>
        <Badge label={i18n.t(`voiceReceptionist.states.${state}`)} tone={STATE_TONES[state]} />
        {canToggleVoiceReceptionist(overview) ? (
          <Switch
            isOn={overview.isEnabled}
            isDisabled={switching.isToggling}
            accessibilityLabel={i18n.t('voiceReceptionist.status.switchLabel')}
            onToggle={switching.toggle}
          />
        ) : null}
      </View>
      <View style={VOICE_FLEX_TEXT_STYLE}>
        <Text color="ink2">{describeState(state, overview.line !== null)}</Text>
      </View>
      {switching.errorMessage === null ? null : (
        <FormErrorBanner message={switching.errorMessage} />
      )}
    </View>
  );
}
