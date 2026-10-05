import { Controller, type Control } from 'react-hook-form';
import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';
import { CHOICE_CARD_LIST_STYLE, ChoiceCard } from '@/ui/molecules/ChoiceCard';

import { GOAL_IDS, toggleGoalSelection } from '../model/goal-options';
import type { RegisterGoalsFormValues } from '../schemas/auth-forms.schema';

interface GoalsFieldProps {
  control: Control<RegisterGoalsFormValues>;
}

export function GoalsField({ control }: Readonly<GoalsFieldProps>): React.JSX.Element {
  return (
    <Controller
      control={control}
      name="goalIds"
      render={({ field }) => (
        <>
          <Text variant="titleMd">{i18n.t('auth.register.goalsQuestion')}</Text>
          <View style={CHOICE_CARD_LIST_STYLE}>
            {GOAL_IDS.map((goalId) => (
              <ChoiceCard
                key={goalId}
                indicator="checkbox"
                label={i18n.t(`auth.register.goals.${goalId}`)}
                isSelected={field.value.includes(goalId)}
                onPress={() => {
                  field.onChange(toggleGoalSelection(field.value, goalId));
                }}
              />
            ))}
          </View>
        </>
      )}
    />
  );
}
