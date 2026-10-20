import { Controller, type Control } from 'react-hook-form';
import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';
import { CHOICE_CARD_LIST_STYLE, ChoiceCard } from '@/ui/molecules/ChoiceCard';

import { WORK_MODES, type CenterDetailsFormValues } from '../schemas/center-details.schema';
import { WORK_MODE_PICKER_STYLE } from './WorkModePicker.styles';

interface WorkModePickerProps {
  control: Control<CenterDetailsFormValues>;
}

/**
 * «¿Cómo trabajas?»: decide qué módulos lleva el centro (clases, bonos, asistencia…). Quien solo da
 * citas empieza con lo mínimo y puede encender el resto después desde los ajustes.
 */
export function WorkModePicker({ control }: Readonly<WorkModePickerProps>): React.JSX.Element {
  return (
    <View style={WORK_MODE_PICKER_STYLE}>
      <Text variant="bodyStrong">{i18n.t('onboarding.center.workModeLabel')}</Text>
      <Controller
        control={control}
        name="workMode"
        render={({ field }) => (
          <View style={CHOICE_CARD_LIST_STYLE}>
            {WORK_MODES.map((workMode) => (
              <ChoiceCard
                key={workMode}
                indicator="radio"
                label={i18n.t(`onboarding.workModes.${workMode}.label`)}
                description={i18n.t(`onboarding.workModes.${workMode}.description`)}
                isSelected={field.value === workMode}
                onPress={() => {
                  field.onChange(workMode);
                }}
              />
            ))}
          </View>
        )}
      />
    </View>
  );
}
