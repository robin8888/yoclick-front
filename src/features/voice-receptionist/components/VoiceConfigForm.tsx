import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';

import type { VoiceOverviewResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';

import { useSaveVoiceConfig } from '../hooks/useSaveVoiceConfig';
import {
  buildVoiceConfigFormValues,
  mapVoiceConfigFormToRequest,
  voiceConfigFormSchema,
  type VoiceConfigFormValues,
} from '../model/voice-config-form';
import { createVoiceCardStyle } from './VoiceCard.styles';
import { AssistantFields, CallRulesFields, RoutingFields } from './VoiceConfigFields';

/** Ajustes del contestador: saludo, desvío, aviso legal, transferencia, retención y fin de minutos. */
export function VoiceConfigForm({
  overview,
}: Readonly<{ overview: VoiceOverviewResponseDto }>): React.JSX.Element {
  const theme = useTheme();
  const { canCustomizeAssistant } = overview.capabilities;
  const { control, handleSubmit } = useForm<VoiceConfigFormValues>({
    resolver: zodResolver(voiceConfigFormSchema),
    defaultValues: buildVoiceConfigFormValues(overview.config),
  });
  const saving = useSaveVoiceConfig();

  return (
    <View style={createVoiceCardStyle(theme)}>
      <Text variant="titleMd" role="heading">
        {i18n.t('voiceReceptionist.config.title')}
      </Text>
      <AssistantFields control={control} canCustomizeAssistant={canCustomizeAssistant} />
      <CallRulesFields control={control} />
      <RoutingFields control={control} />
      {saving.errorMessage === null ? null : <FormErrorBanner message={saving.errorMessage} />}
      {saving.isSaved ? (
        <FormErrorBanner tone="success" message={i18n.t('voiceReceptionist.config.savedMessage')} />
      ) : null}
      <Button
        isFullWidth
        isLoading={saving.isSaving}
        label={i18n.t('voiceReceptionist.config.saveAction')}
        onPress={() => {
          void handleSubmit((formValues) => {
            saving.saveConfig(mapVoiceConfigFormToRequest(formValues, canCustomizeAssistant));
          })();
        }}
      />
    </View>
  );
}
