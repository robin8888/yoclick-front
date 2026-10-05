import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';
import { ProgressRing } from '@/ui/molecules/ProgressRing';

import { createWeeklyCardStyle, WEEKLY_TEXT_STYLE } from './WeeklyProgressCard.styles';

interface WeeklyProgressCardProps {
  completedCount: number;
  goalCount: number;
}

/** Prototipo `home`, «Esta semana»: sesiones hechas frente al objetivo semanal. */
export function WeeklyProgressCard({
  completedCount,
  goalCount,
}: Readonly<WeeklyProgressCardProps>): React.JSX.Element {
  const theme = useTheme();
  const remainingCount = Math.max(0, goalCount - completedCount);
  const countLabel = i18n.t('booking.home.weekCount', { completedCount, goalCount });

  return (
    <View style={createWeeklyCardStyle(theme)}>
      <ProgressRing progress={completedCount / goalCount} accessibilityLabel={countLabel} />
      <View style={WEEKLY_TEXT_STYLE}>
        <Text variant="overline" color="ink2">
          {i18n.t('booking.home.weekTitle')}
        </Text>
        <Text variant="metric">
          {completedCount}{' '}
          <Text variant="caption" color="ink2">
            {i18n.t('booking.home.weekOfGoal', { goalCount })}
          </Text>
        </Text>
        <Text variant="caption" color="ink2">
          {remainingCount === 0
            ? i18n.t('booking.home.weekGoalReached')
            : i18n.t('booking.home.weekRemaining', { remainingCount })}
        </Text>
      </View>
    </View>
  );
}
