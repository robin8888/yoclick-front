import { View } from 'react-native';

import { WaitlistSessionAction } from '@/features/waitlist';
import type {
  MyWaitlistResponseDtoEntriesItem,
  ServiceSessionsResponseDto,
} from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { formatTime24h } from '@/shared/lib/format/format-time';
import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import { createFullClassRowStyle } from './FullClassRow.styles';

interface FullClassRowProps {
  session: ServiceSessionsResponseDto['sessions'][number];
  timeZone: string;
  waitlistEntry: MyWaitlistResponseDtoEntriesItem | undefined;
}

/** Una clase sin plazas: no se puede elegir, pero se puede entrar en su lista de espera. */
export function FullClassRow({
  session,
  timeZone,
  waitlistEntry,
}: Readonly<FullClassRowProps>): React.JSX.Element {
  const theme = useTheme();
  const timeRange = i18n.t('booking.slot.classOption', {
    startTime: formatTime24h(session.startsAt, timeZone),
    endTime: formatTime24h(session.endsAt, timeZone),
  });

  return (
    <View style={createFullClassRowStyle(theme)}>
      <Text variant="bodyStrong">{timeRange}</Text>
      <Text variant="caption" color="ink2">
        {i18n.t('waitlist.classFull', { teacher: session.teacher.fullName })}
      </Text>
      <WaitlistSessionAction
        classSessionId={session.id}
        entry={waitlistEntry}
        timeZone={timeZone}
      />
    </View>
  );
}
