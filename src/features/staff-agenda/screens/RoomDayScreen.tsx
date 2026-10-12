import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';

import { LoadErrorState } from '@/features/join';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Text } from '@/ui/atoms/Text';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { RoomBlockCard } from '../components/RoomBlockCard';
import { RoomSessionDetail } from '../components/RoomSessionDetail';
import { useRoomAgenda } from '../hooks/useRoomAgenda';
import { type RoomDay } from '../model/room-agenda';
import { roomDayRouteParamsSchema } from '../model/room-day-route-params';

interface RoomDayBodyProps {
  room: RoomDay | undefined;
  timeZone: string;
  isoDate: string;
}

/** Los bloqueos y las clases de la sala ese día, por orden de hora. */
function RoomDayBody({ room, timeZone, isoDate }: Readonly<RoomDayBodyProps>): React.JSX.Element {
  if (room === undefined) {
    return <Text color="ink2">{i18n.t('staffAgenda.rooms.roomNotFound')}</Text>;
  }
  if (room.sessions.length === 0 && room.blocks.length === 0) {
    return <Text color="ink2">{i18n.t('staffAgenda.rooms.freeAllDay')}</Text>;
  }
  return (
    <>
      {room.blocks.map((block) => (
        <RoomBlockCard key={block.id} block={block} timeZone={timeZone} />
      ))}
      {room.sessions.map((session) => (
        <RoomSessionDetail
          key={session.id}
          session={session}
          timeZone={timeZone}
          isoDate={isoDate}
        />
      ))}
    </>
  );
}

function RoomDayContent({
  roomId,
  isoDate,
}: Readonly<{ roomId: string; isoDate: string }>): React.JSX.Element {
  const router = useRouter();
  const agenda = useRoomAgenda(isoDate);
  const room = agenda.data?.rooms.find((candidate) => candidate.id === roomId);

  return (
    <ScreenTemplate
      title={room?.name ?? i18n.t('staffAgenda.rooms.roomTitle')}
      subtitle={room && i18n.t('staffAgenda.rooms.roomSummary', { capacity: room.capacity })}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
    >
      {agenda.isPending ? (
        <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />
      ) : null}
      {agenda.isError ? (
        <LoadErrorState
          title={i18n.t('staffAgenda.agenda.errorTitle')}
          error={agenda.error}
          onRetry={() => void agenda.refetch()}
          isRetrying={agenda.isFetching}
        />
      ) : null}
      {agenda.data === undefined ? null : (
        <RoomDayBody room={room} timeZone={agenda.data.timezone} isoDate={isoDate} />
      )}
    </ScreenTemplate>
  );
}

/** Detalle de una sala un día: bloqueos, qué clase la ocupa, aforo, alumnos y cancelar un día. */
export function RoomDayScreen(): React.JSX.Element {
  const params = roomDayRouteParamsSchema.safeParse(useLocalSearchParams());

  if (!params.success) return <Redirect href="/" />;
  return <RoomDayContent roomId={params.data.roomId} isoDate={params.data.date} />;
}
