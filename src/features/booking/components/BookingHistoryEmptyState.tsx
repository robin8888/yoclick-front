import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Badge } from '@/ui/atoms/Badge';
import { Button } from '@/ui/atoms/Button';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import { presentBookingStatus, type BookingStatus } from '../model/booking-status';
import {
  createHistoryBadgesStyle,
  createHistoryEmptyStyle,
  createHistoryIconCircleStyle,
  HISTORY_ACTION_ROW_STYLE,
} from './BookingHistoryEmptyState.styles';

/** Los estados que acabarán apareciendo en el historial, como adelanto de lo que se verá aquí. */
const HISTORY_STATUSES: readonly BookingStatus[] = ['attended', 'cancelled', 'no_show'];

interface BookingHistoryEmptyStateProps {
  onBookAction: () => void;
}

/** Historial sin citas todavía: dice qué aparecerá aquí y lleva a reservar la primera. */
export function BookingHistoryEmptyState({
  onBookAction,
}: Readonly<BookingHistoryEmptyStateProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createHistoryEmptyStyle(theme)}>
      <View style={createHistoryIconCircleStyle(theme)}>
        <Icon name="clock" size="large" color="brandInk" />
      </View>
      <Text variant="titleMd" align="center">
        {i18n.t('booking.list.emptyPastTitle')}
      </Text>
      <Text variant="caption" color="ink2" align="center">
        {i18n.t('booking.list.emptyPastDescription')}
      </Text>
      <View style={createHistoryBadgesStyle(theme)}>
        {HISTORY_STATUSES.map((status) => (
          <Badge
            key={status}
            label={i18n.t(`booking.list.status.${status}`)}
            tone={presentBookingStatus(status).tone}
          />
        ))}
      </View>
      <View style={HISTORY_ACTION_ROW_STYLE}>
        <Button
          variant="primary"
          leadingIconName="plus"
          label={i18n.t('booking.list.bookAction')}
          onPress={onBookAction}
        />
      </View>
    </View>
  );
}
