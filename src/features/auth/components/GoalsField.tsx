import { Controller, type Control } from 'react-hook-form';

import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';
import { ListItem } from '@/ui/molecules/ListItem';

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
          {GOAL_IDS.map((goalId) => (
            <ListItem
              key={goalId}
              title={i18n.t(`auth.register.goals.${goalId}`)}
              isSelected={field.value.includes(goalId)}
              onPress={() => {
                field.onChange(toggleGoalSelection(field.value, goalId));
              }}
            />
          ))}
        </>
      )}
    />
  );
}
