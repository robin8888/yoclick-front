import { View } from 'react-native';

import { LoadErrorState } from '@/features/join';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { formatTime24h } from '@/shared/lib/format/format-time';
import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';

import type { ChosenClient } from '../hooks/useNewAppointmentForm';
import type { useRoomAgenda } from '../hooks/useRoomAgenda';
import { canJoinSession, type FoundSession } from '../model/room-agenda';
import { createEntryCardStyle } from './AgendaEntryCard.styles';
import { ClientChoiceField } from './ClientChoiceField';

interface JoinSessionFieldsProps {
  agenda: ReturnType<typeof useRoomAgenda>;
  /** La sesión a la que se apunta, ya localizada en la agenda; `undefined` si no está. */
  found: FoundSession | undefined;
  clients: readonly ChosenClient[];
  onClientToggle: (client: ChosenClient) => void;
  onClientsClear: () => void;
}

/** Lo que ya se sabe de la clase: servicio, profesor, sala, hora y plazas. */
function SessionSummary({
  found,
  timeZone,
}: Readonly<{ found: FoundSession; timeZone: string }>): React.JSX.Element {
  const theme = useTheme();
  const { session, roomName } = found;
  const isJoinable = canJoinSession(session, new Date());
  const timeRange = i18n.t('staffAgenda.agenda.timeRange', {
    startTime: formatTime24h(session.startsAt, timeZone),
    endTime: formatTime24h(session.endsAt, timeZone),
  });

  return (
    <View style={createEntryCardStyle(theme)}>
      <Text variant="bodyStrong">{session.service.name}</Text>
      <Text>{i18n.t('staffAgenda.rooms.teacherLine', { teacher: session.teacher.fullName })}</Text>
      <Text color="ink2">{roomName === null ? timeRange : `${roomName} · ${timeRange}`}</Text>
      <Text color={isJoinable ? 'ink2' : 'danger'}>
        {isJoinable
          ? i18n.t('staffAgenda.rooms.seats', {
              booked: session.bookedCount,
              capacity: session.capacity,
            })
          : i18n.t('staffAgenda.newAppointment.sessionNotJoinable')}
      </Text>
    </View>
  );
}

/**
 * Apuntar a alguien a una clase que ya existe: la clase viene decidida (servicio, profesor, sala y
 * hora), así que solo se elige a la persona.
 */
export function JoinSessionFields({
  agenda,
  found,
  clients,
  onClientToggle,
  onClientsClear,
}: Readonly<JoinSessionFieldsProps>): React.JSX.Element {
  if (agenda.isPending) return <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />;
  if (agenda.isError) {
    return (
      <LoadErrorState
        title={i18n.t('staffAgenda.agenda.errorTitle')}
        error={agenda.error}
        onRetry={() => void agenda.refetch()}
        isRetrying={agenda.isFetching}
      />
    );
  }
  if (found === undefined) {
    return <Text color="ink2">{i18n.t('staffAgenda.newAppointment.sessionNotFound')}</Text>;
  }
  return (
    <>
      <Text variant="titleMd">{i18n.t('staffAgenda.newAppointment.joinSessionLabel')}</Text>
      <SessionSummary found={found} timeZone={agenda.data.timezone} />
      <ClientChoiceField
        clients={clients}
        canChooseSeveral
        onClientToggle={onClientToggle}
        onClientsClear={onClientsClear}
      />
    </>
  );
}
