import { useState } from 'react';
import { View } from 'react-native';

import type { RoomAgendaResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import { useTickingNow } from '@/shared/hooks/useTickingNow';
import { assignRoomMarks, findRoomMark, type RoomMark } from '../model/room-marks';
import {
  buildRoomTimeline,
  filterTimelineByRoom,
  filterTimelineByService,
  listServicesOfTimeline,
  type TimelineHour,
} from '../model/room-timeline';
import {
  createEmptyHourStyle,
  createHourCardsStyle,
  createHourLabelStyle,
  HOUR_ROW_STYLE,
} from './RoomDayGrid.styles';
import { RoomLegend } from './RoomLegend';
import { ServiceFilter } from './ServiceFilter';
import { RoomSessionChip } from './RoomSessionChip';

/** Las fichas pasan a «Terminada» solas; con refrescar cada minuto basta. */
const NOW_REFRESH_MS = 60_000;

interface HourRowProps {
  hour: TimelineHour;
  marks: readonly RoomMark[];
  timeZone: string;
  isoDate: string;
  now: Date;
  isStaffLane: boolean;
}

/** Una ficha por clase de esa hora, en línea y envueltas si no caben. */
function HourChips({
  hour,
  marks,
  timeZone,
  isoDate,
  now,
  isStaffLane,
}: Readonly<HourRowProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createHourCardsStyle(theme)}>
      {hour.blocks.map((block) => {
        const mark = findRoomMark(marks, block.roomId);
        return mark === undefined ? null : (
          <RoomSessionChip
            key={block.session.id}
            block={block}
            mark={mark}
            timeZone={timeZone}
            isoDate={isoDate}
            now={now}
            isStaffLane={isStaffLane}
          />
        );
      })}
    </View>
  );
}

/** Una hora: la etiqueta y sus fichas, o una raya fina si no hay nada. */
function HourRow(props: Readonly<HourRowProps>): React.JSX.Element {
  const theme = useTheme();
  const { hour } = props;
  const isEmpty = hour.blocks.length === 0;

  return (
    <View style={HOUR_ROW_STYLE}>
      <View style={createHourLabelStyle(theme)}>
        <Text variant="caption" color={isEmpty ? 'ink2' : 'ink'}>
          {hour.label}
        </Text>
      </View>
      {isEmpty ? <View style={createEmptyHourStyle(theme)} /> : <HourChips {...props} />}
    </View>
  );
}

interface RoomDayGridProps {
  agenda: RoomAgendaResponseDto;
  isoDate: string;
  /** Centro sin salas: cada «sala» de la agenda es un profesional. */
  isStaffLane?: boolean;
}

/**
 * La agenda del centro como rejilla del día: la leyenda de salas (letra y color) y una fila por
 * hora con una ficha pequeña por clase, para que muchas salas a la vez quepan de un
 * vistazo. Tocar una sala en la leyenda filtra; tocar una ficha abre el detalle de la sala.
 */
export function RoomDayGrid({
  agenda,
  isoDate,
  isStaffLane = false,
}: Readonly<RoomDayGridProps>): React.JSX.Element {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const marks = assignRoomMarks(agenda.rooms);
  const now = useTickingNow(NOW_REFRESH_MS);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const allHours = buildRoomTimeline(agenda);
  const hours = filterTimelineByService(
    filterTimelineByRoom(allHours, selectedRoomId),
    selectedServiceId,
  );

  if (hours.length === 0) {
    return <Text color="ink2">{i18n.t('staffAgenda.rooms.closedDay')}</Text>;
  }
  return (
    <>
      <RoomLegend marks={marks} selectedRoomId={selectedRoomId} onRoomSelect={setSelectedRoomId} />
      <ServiceFilter
        services={listServicesOfTimeline(allHours)}
        selectedServiceId={selectedServiceId}
        onServiceSelect={setSelectedServiceId}
      />
      {hours.map((hour) => (
        <HourRow
          key={hour.label}
          hour={hour}
          marks={marks}
          timeZone={agenda.timezone}
          isoDate={isoDate}
          now={now}
          isStaffLane={isStaffLane}
        />
      ))}
    </>
  );
}
