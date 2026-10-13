import { View } from 'react-native';

import type { ServiceSessionsResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { formatTime24h } from '@/shared/lib/format/format-time';
import { Text } from '@/ui/atoms/Text';
import { OptionCard } from '@/ui/molecules/OptionCard';

type OpenSession = ServiceSessionsResponseDto['sessions'][number];

const LIST_STYLE = { gap: 8 } as const;

interface ClassSessionListProps {
  sessions: readonly OpenSession[];
  timeZone: string;
  selectedSessionId: string | null;
  onSessionSelect: (session: OpenSession) => void;
}

/** Las clases de ese día con su hora y las plazas que quedan; se elige una. */
export function ClassSessionList({
  sessions,
  timeZone,
  selectedSessionId,
  onSessionSelect,
}: Readonly<ClassSessionListProps>): React.JSX.Element {
  if (sessions.length === 0) {
    return <Text color="ink2">{i18n.t('booking.slot.noClassThisDay')}</Text>;
  }
  return (
    <View style={LIST_STYLE}>
      {sessions.map((session) => (
        <OptionCard
          key={session.id}
          title={i18n.t('booking.slot.classOption', {
            startTime: formatTime24h(session.startsAt, timeZone),
            endTime: formatTime24h(session.endsAt, timeZone),
          })}
          description={i18n.t('booking.slot.classSeats', {
            remaining: session.remainingSeats,
            capacity: session.capacity,
            teacher: session.teacher.fullName,
          })}
          isSelected={session.id === selectedSessionId}
          onPress={() => {
            onSessionSelect(session);
          }}
        />
      ))}
    </View>
  );
}
