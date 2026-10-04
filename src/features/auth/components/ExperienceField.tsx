import { Controller, type Control } from 'react-hook-form';

import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';
import { ListItem } from '@/ui/molecules/ListItem';

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
          {EXPERIENCE_DURATIONS.map((experience) => (
            <ListItem
              key={experience}
              title={i18n.t(`auth.register.experience.${experience}`)}
              isSelected={field.value === experience}
              onPress={() => {
                field.onChange(experience);
              }}
            />
          ))}
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
