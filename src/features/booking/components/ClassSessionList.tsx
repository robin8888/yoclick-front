import { View } from 'react-native';

import { useMyWaitlist } from '@/features/waitlist';
import type { ServiceSessionsResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { formatTime24h } from '@/shared/lib/format/format-time';
import { Text } from '@/ui/atoms/Text';
import { OptionCard } from '@/ui/molecules/OptionCard';

import { FullClassRow } from './FullClassRow';

type OpenSession = ServiceSessionsResponseDto['sessions'][number];

const LIST_STYLE = { gap: 8 } as const;

interface ClassSessionListProps {
  sessions: readonly OpenSession[];
  timeZone: string;
  selectedSessionId: string | null;
  onSessionSelect: (session: OpenSession) => void;
}

interface SelectableClassProps {
  session: OpenSession;
  timeZone: string;
  isSelected: boolean;
  onSessionSelect: (session: OpenSession) => void;
}

function SelectableClass({
  session,
  timeZone,
  isSelected,
  onSessionSelect,
}: Readonly<SelectableClassProps>): React.JSX.Element {
  return (
    <OptionCard
      title={i18n.t('booking.slot.classOption', {
        startTime: formatTime24h(session.startsAt, timeZone),
        endTime: formatTime24h(session.endsAt, timeZone),
      })}
      description={i18n.t('booking.slot.classSeats', {
        remaining: session.remainingSeats,
        capacity: session.capacity,
        teacher: session.teacher.fullName,
      })}
      isSelected={isSelected}
      onPress={() => {
        onSessionSelect(session);
      }}
    />
  );
}

/**
 * Las clases de ese día con su hora y las plazas que quedan; se elige una. Las llenas no se eligen:
 * ofrecen su lista de espera.
 */
export function ClassSessionList({
  sessions,
  timeZone,
  selectedSessionId,
  onSessionSelect,
}: Readonly<ClassSessionListProps>): React.JSX.Element {
  const waitlistEntries = useMyWaitlist().data?.entries ?? [];
  if (sessions.length === 0) {
    return <Text color="ink2">{i18n.t('booking.slot.noClassThisDay')}</Text>;
  }
  return (
    <View style={LIST_STYLE}>
      {sessions.map((session) =>
        session.remainingSeats === 0 ? (
          <FullClassRow
            key={session.id}
            session={session}
            timeZone={timeZone}
            waitlistEntry={waitlistEntries.find((entry) => entry.classSessionId === session.id)}
          />
        ) : (
          <SelectableClass
            key={session.id}
            session={session}
            timeZone={timeZone}
            isSelected={session.id === selectedSessionId}
            onSessionSelect={onSessionSelect}
          />
        ),
      )}
    </View>
  );
}
