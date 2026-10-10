import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import type { RoomAgendaResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { formatTime24h } from '@/shared/lib/format/format-time';
import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import { buildRoomTimeline, type TimelineBlock } from '../model/room-timeline';
import { createEntryCardStyle } from './AgendaEntryCard.styles';
import { createHourLabelStyle, HOUR_ROW_STYLE, HOUR_BLOCKS_STYLE } from './RoomTimeline.styles';

interface BlockProps {
  block: TimelineBlock;
  timeZone: string;
  isoDate: string;
}

/** «Faltan 7 para el aforo» en rojo, «Aforo completo» o «Cita privada». */
function SeatsCaption({ block }: Readonly<{ block: TimelineBlock }>): React.JSX.Element {
  const { session } = block;

  if (session.mode === 'private') {
    return (
      <Text variant="caption" color="ink2">
        {i18n.t('staffAgenda.rooms.privateClass')}
      </Text>
    );
  }
  if (block.missingCount === 0) {
    return (
      <Text variant="caption" color="success">
        {i18n.t('staffAgenda.rooms.completeRoom', { capacity: session.capacity })}
      </Text>
    );
  }
  return (
    <Text variant="caption" color="danger">
      {i18n.t('staffAgenda.rooms.missing', {
        count: block.missingCount,
        booked: session.bookedCount,
        capacity: session.capacity,
      })}
    </Text>
  );
}

/** Una sala reservada: servicio, profesor y, en rojo, las personas que faltan para el aforo. */
function TimelineBlockCard({ block, timeZone, isoDate }: Readonly<BlockProps>): React.JSX.Element {
  const theme = useTheme();
  const router = useRouter();
  const { session } = block;
  const timeRange = i18n.t('staffAgenda.agenda.timeRange', {
    startTime: formatTime24h(session.startsAt, timeZone),
    endTime: formatTime24h(session.endsAt, timeZone),
  });

  return (
    <Pressable
      role="button"
      accessibilityLabel={i18n.t('staffAgenda.rooms.blockLabel', {
        room: block.roomName,
        service: session.service.name,
        time: timeRange,
      })}
      onPress={() => {
        router.push({
          pathname: '/(admin)/room-day/[roomId]',
          params: { roomId: block.roomId, date: isoDate },
        });
      }}
      style={createEntryCardStyle(theme)}
    >
      <Text variant="bodyStrong">{block.roomName}</Text>
      <Text>
        {i18n.t('staffAgenda.rooms.classAndTeacher', {
          service: session.service.name,
          teacher: session.teacher.fullName,
        })}
      </Text>
      <Text variant="caption" color="ink2">
        {timeRange}
      </Text>
      <SeatsCaption block={block} />
    </Pressable>
  );
}

interface RoomTimelineProps {
  agenda: RoomAgendaResponseDto;
  isoDate: string;
}

/**
 * La agenda del centro como línea temporal del día: una fila por cada hora de apertura y, en cada
 * una, las salas reservadas con el servicio y las personas que faltan para completar el aforo.
 */
export function RoomTimeline({ agenda, isoDate }: Readonly<RoomTimelineProps>): React.JSX.Element {
  const theme = useTheme();
  const hours = buildRoomTimeline(agenda);

  if (hours.length === 0) {
    return <Text color="ink2">{i18n.t('staffAgenda.rooms.closedDay')}</Text>;
  }
  return (
    <>
      {hours.map((hour) => (
        <View key={hour.label} style={HOUR_ROW_STYLE}>
          <View style={createHourLabelStyle(theme)}>
            <Text variant="bodyStrong">{hour.label}</Text>
          </View>
          <View style={HOUR_BLOCKS_STYLE}>
            {hour.blocks.length === 0 ? (
              <Text color="ink2">{i18n.t('staffAgenda.rooms.noClassesThisHour')}</Text>
            ) : null}
            {hour.blocks.map((block) => (
              <TimelineBlockCard
                key={block.session.id}
                block={block}
                timeZone={agenda.timezone}
                isoDate={isoDate}
              />
            ))}
          </View>
        </View>
      ))}
    </>
  );
}
