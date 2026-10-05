import { View } from 'react-native';

import type { SessionRecordsResponseDtoTotalsItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import { formatTimerDuration } from '../model/session-timer';
import { createTotalsCardStyle } from './StaffTotalsCard.styles';

interface StaffTotalsCardProps {
  total: SessionRecordsResponseDtoTotalsItem;
}

/** Cuántas clases dio un profesional, cuánto tiempo real y cuántas se quedaron sin cerrar. */
export function StaffTotalsCard({ total }: Readonly<StaffTotalsCardProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createTotalsCardStyle(theme)}>
      <Text variant="bodyStrong">{total.staffName}</Text>
      <Text color="ink2">
        {i18n.t('staffAgenda.records.classCount', { count: total.classCount })}
      </Text>
      <Text color="ink2">
        {i18n.t('staffAgenda.records.totalTime', {
          actual: formatTimerDuration(total.actualSeconds),
          planned: formatTimerDuration(total.plannedSeconds),
        })}
      </Text>
      {total.openCount === 0 ? null : (
        <Text color="warning" variant="bodyStrong">
          {i18n.t('staffAgenda.records.openCount', { count: total.openCount })}
        </Text>
      )}
    </View>
  );
}
