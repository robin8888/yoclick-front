import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';

import {
  describeDayTimeRanges,
  type DayTimeRange,
  type RoomBlockAvailability,
} from '../model/room-block-availability';

interface RoomBlockAvailabilityNoticeProps {
  availability: RoomBlockAvailability | null;
  busyRanges: readonly DayTimeRange[];
}

const NOTICE_STYLE = { gap: 4 } as const;

function describeProblem(availability: RoomBlockAvailability): string | null {
  switch (availability.status) {
    case 'available':
      return null;
    case 'in_the_past':
      return i18n.t('centerAdmin.roomBlocks.availability.inThePast');
    case 'outside_opening_hours':
      return i18n.t('centerAdmin.roomBlocks.availability.outsideOpeningHours', {
        ranges: describeDayTimeRanges(availability.openingRanges),
      });
    case 'occupied':
      return i18n.t('centerAdmin.roomBlocks.availability.occupied', {
        ranges: describeDayTimeRanges(availability.busyRanges),
      });
  }
}

/** Avisa de por qué no se puede separar ese tramo, o de lo que ya ocupa el espacio ese día. */
export function RoomBlockAvailabilityNotice({
  availability,
  busyRanges,
}: Readonly<RoomBlockAvailabilityNoticeProps>): React.JSX.Element | null {
  const problem = availability === null ? null : describeProblem(availability);
  if (problem !== null) {
    return (
      <Text variant="caption" color="danger" role="alert">
        {problem}
      </Text>
    );
  }
  if (busyRanges.length === 0) return null;
  return (
    <View style={NOTICE_STYLE}>
      <Text variant="caption" color="ink2">
        {i18n.t('centerAdmin.roomBlocks.availability.busyDay', {
          ranges: describeDayTimeRanges(busyRanges),
        })}
      </Text>
    </View>
  );
}
