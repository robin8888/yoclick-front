import { Controller, type Control } from 'react-hook-form';
import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';
import { FormTextField } from '@/ui/molecules/FormTextField';
import { OptionCard } from '@/ui/molecules/OptionCard';

import {
  FORWARDING_MODES,
  OVERAGE_POLICIES,
  type VoiceConfigFormValues,
} from '../model/voice-config-form';
import { createVoiceListStyle } from './VoiceCard.styles';

interface FieldsProps {
  control: Control<VoiceConfigFormValues>;
}

/** Saludo y nombre del asistente: solo editables si el centro puede personalizarlos. */
export function AssistantFields({
  control,
  canCustomizeAssistant,
}: Readonly<FieldsProps & { canCustomizeAssistant: boolean }>): React.JSX.Element {
  return (
    <>
      <FormTextField
        control={control}
        name="greeting"
        label={i18n.t('voiceReceptionist.config.greetingLabel')}
        helperText={i18n.t('voiceReceptionist.config.greetingHelper')}
        isDisabled={!canCustomizeAssistant}
        isMultiline
      />
      <FormTextField
        control={control}
        name="assistantName"
        label={i18n.t('voiceReceptionist.config.assistantNameLabel')}
        isDisabled={!canCustomizeAssistant}
      />
      {canCustomizeAssistant ? null : (
        <Text variant="caption" color="ink2">
          {i18n.t('voiceReceptionist.config.customizeLocked')}
        </Text>
      )}
    </>
  );
}

/** Aviso legal, teléfono de transferencia y días que se guardan las transcripciones. */
export function CallRulesFields({ control }: Readonly<FieldsProps>): React.JSX.Element {
  return (
    <>
      <FormTextField
        control={control}
        name="legalNotice"
        label={i18n.t('voiceReceptionist.config.legalNoticeLabel')}
        helperText={i18n.t('voiceReceptionist.config.legalNoticeHelper')}
        isMultiline
      />
      <FormTextField
        control={control}
        name="humanTransferPhone"
        label={i18n.t('voiceReceptionist.config.transferPhoneLabel')}
        helperText={i18n.t('voiceReceptionist.config.transferPhoneHelper')}
        keyboardType="phone-pad"
      />
      <FormTextField
        control={control}
        name="transcriptRetentionDays"
        label={i18n.t('voiceReceptionist.config.retentionLabel')}
        keyboardType="number-pad"
      />
    </>
  );
}

function ChoiceGroup<TName extends 'forwardingMode' | 'overagePolicy'>({
  control,
  name,
  groupLabel,
  values,
  describeValue,
}: Readonly<
  FieldsProps & {
    name: TName;
    groupLabel: string;
    values: readonly VoiceConfigFormValues[TName][];
    describeValue: (value: VoiceConfigFormValues[TName]) => string;
  }
>): React.JSX.Element {
  const theme = useTheme();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <View style={createVoiceListStyle(theme)}>
          <Text variant="bodyStrong">{groupLabel}</Text>
          {values.map((value) => (
            <OptionCard
              key={value}
              title={describeValue(value)}
              isSelected={field.value === value}
              onPress={() => {
                field.onChange(value);
              }}
            />
          ))}
        </View>
      )}
    />
  );
}

/** Cuándo se desvía la llamada y qué pasa cuando se acaban los minutos incluidos. */
export function RoutingFields({ control }: Readonly<FieldsProps>): React.JSX.Element {
  return (
    <>
      <ChoiceGroup
        control={control}
        name="forwardingMode"
        groupLabel={i18n.t('voiceReceptionist.config.forwardingModeLabel')}
        values={FORWARDING_MODES}
        describeValue={(mode) => i18n.t(`voiceReceptionist.line.forwardingModes.${mode}`)}
      />
      <ChoiceGroup
        control={control}
        name="overagePolicy"
        groupLabel={i18n.t('voiceReceptionist.config.overagePolicyLabel')}
        values={OVERAGE_POLICIES}
        describeValue={(policy) =>
          i18n.t(`voiceReceptionist.config.overagePolicyOptions.${policy}`)
        }
      />
    </>
  );
}
