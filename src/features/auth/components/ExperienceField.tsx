import { Controller, type Control } from 'react-hook-form';
import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';
import { CHOICE_CARD_LIST_STYLE, ChoiceCard } from '@/ui/molecules/ChoiceCard';

import { EXPERIENCE_DURATIONS } from '../model/starting-level';
import type { RegisterGoalsFormValues } from '../schemas/auth-forms.schema';

interface ExperienceFieldProps {
  control: Control<RegisterGoalsFormValues>;
}

export function ExperienceField({ control }: Readonly<ExperienceFieldProps>): React.JSX.Element {
  return (
    <Controller
      control={control}
      name="experience"
      render={({ field, fieldState }) => (
        <>
          <Text variant="titleMd">{i18n.t('auth.register.experienceQuestion')}</Text>
          <View style={CHOICE_CARD_LIST_STYLE}>
            {EXPERIENCE_DURATIONS.map((experience) => (
              <ChoiceCard
                key={experience}
                indicator="radio"
                label={i18n.t(`auth.register.experience.${experience}`)}
                isSelected={field.value === experience}
                onPress={() => {
                  field.onChange(experience);
                }}
              />
            ))}
          </View>
          {fieldState.error === undefined ? null : (
            <Text variant="caption" color="danger" role="alert">
              {fieldState.error.message}
            </Text>
          )}
        </>
      )}
    />
  );
}
