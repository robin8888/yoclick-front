import { Linking, View } from 'react-native';

import type { VoiceOverviewResponseDto } from '@/shared/api/generated/model';
import { useCopyToClipboard } from '@/shared/hooks/useCopyToClipboard';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';

import { createVoiceCardStyle, createVoiceListStyle } from './VoiceCard.styles';

type ForwardingMode = NonNullable<VoiceOverviewResponseDto['config']>['forwardingMode'];

const FORWARDING_MODE_ORDER: readonly ForwardingMode[] = [
  'always',
  'no_answer',
  'busy',
  'outside_hours',
];
const TEST_STEP_KEYS = ['first', 'second', 'third'] as const;

function ForwardingInstructions({
  selectedMode,
}: Readonly<{ selectedMode: ForwardingMode | null }>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createVoiceListStyle(theme)}>
      <Text variant="bodyStrong">{i18n.t('voiceReceptionist.line.forwardingTitle')}</Text>
      <Text color="ink2">{i18n.t('voiceReceptionist.line.forwardingIntro')}</Text>
      {FORWARDING_MODE_ORDER.map((mode) => (
        <Text key={mode} color={mode === selectedMode ? 'ink' : 'ink2'}>
          {['•', i18n.t(`voiceReceptionist.line.forwardingModes.${mode}`)].join(' ')}
        </Text>
      ))}
    </View>
  );
}

function TestCallSteps({ phoneNumber }: Readonly<{ phoneNumber: string }>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createVoiceListStyle(theme)}>
      <Text variant="bodyStrong">{i18n.t('voiceReceptionist.line.testTitle')}</Text>
      {TEST_STEP_KEYS.map((stepKey, index) => (
        <Text key={stepKey} color="ink2">
          {[`${String(index + 1)}.`, i18n.t(`voiceReceptionist.line.testSteps.${stepKey}`)].join(
            ' ',
          )}
        </Text>
      ))}
      <Button
        variant="outline"
        label={i18n.t('voiceReceptionist.line.callAction')}
        accessibilityLabel={i18n.t('voiceReceptionist.line.callA11y', { number: phoneNumber })}
        leadingIconName="phone"
        isFullWidth
        onPress={() => {
          void Linking.openURL(`tel:${phoneNumber}`);
        }}
      />
    </View>
  );
}

/** El número puente con su botón de copiar, cómo desviar las llamadas y la llamada de prueba. */
export function VoiceLineCard({
  overview,
}: Readonly<{ overview: VoiceOverviewResponseDto }>): React.JSX.Element {
  const theme = useTheme();
  const { copyText, isCopied } = useCopyToClipboard();
  const phoneNumber = overview.line?.phoneNumber ?? null;

  return (
    <View style={createVoiceCardStyle(theme)}>
      <Text variant="titleMd" role="heading">
        {i18n.t('voiceReceptionist.line.title')}
      </Text>
      <Text color="ink2">{i18n.t('voiceReceptionist.line.description')}</Text>
      {phoneNumber === null ? (
        <Text>{i18n.t('voiceReceptionist.line.noLine')}</Text>
      ) : (
        <>
          <Text variant="titleLg" selectable>
            {phoneNumber}
          </Text>
          <Button
            variant="secondary"
            label={i18n.t(
              isCopied
                ? 'voiceReceptionist.line.copiedAction'
                : 'voiceReceptionist.line.copyAction',
            )}
            accessibilityLabel={i18n.t('voiceReceptionist.line.copyA11y', { number: phoneNumber })}
            leadingIconName="copy"
            isFullWidth
            onPress={() => {
              copyText(phoneNumber);
            }}
          />
          <ForwardingInstructions selectedMode={overview.config?.forwardingMode ?? null} />
          <TestCallSteps phoneNumber={phoneNumber} />
        </>
      )}
    </View>
  );
}
