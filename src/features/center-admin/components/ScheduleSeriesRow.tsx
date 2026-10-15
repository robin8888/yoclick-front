import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Icon } from '@/ui/atoms/Icon';
import { IconButton } from '@/ui/atoms/IconButton';
import { Text } from '@/ui/atoms/Text';

import {
  describeSeriesName,
  describeSeriesPlace,
  type SeriesOfDay,
} from '../model/schedule-summary';
import {
  createScheduleCardStyle,
  createScheduleContentStyle,
  createScheduleTimePillStyle,
} from './ScheduleSeriesRow.styles';

interface ScheduleSeriesRowProps {
  entry: SeriesOfDay;
}

/** Abrir el detalle del horario o su edición directa. */
function useOpenSeries(seriesId: string) {
  const router = useRouter();

  return {
    openDetail: () => {
      router.push({ pathname: '/(admin)/schedules/[seriesId]', params: { seriesId } });
    },
    openEditor: () => {
      router.push({ pathname: '/(admin)/schedules/edit/[seriesId]', params: { seriesId } });
    },
    writeToClass: (className: string) => {
      router.push({ pathname: '/(admin)/messages/group', params: { seriesId, className } });
    },
  };
}

interface RowActionsProps {
  name: string;
  timeRange: string;
  onWriteToClass: () => void;
  onEdit: () => void;
}

/** A la derecha de la fila: escribir a los apuntados y editar el horario. */
function RowActions({
  name,
  timeRange,
  onWriteToClass,
  onEdit,
}: Readonly<RowActionsProps>): React.JSX.Element {
  return (
    <>
      <IconButton
        iconName="messageCircle"
        variant="tonal"
        accessibilityLabel={i18n.t('centerAdmin.schedules.writeToClassRowLabel', { name })}
        onPress={onWriteToClass}
      />
      <IconButton
        iconName="edit"
        variant="tonal"
        accessibilityLabel={i18n.t('centerAdmin.schedules.editRowLabel', { time: timeRange, name })}
        onPress={onEdit}
      />
    </>
  );
}

/**
 * Un horario en la semana: la franja horaria entera, el nombre y el sitio; tocarlo abre el detalle
 * (matriculados, terminar) y el lápiz de al lado lo edita directamente (hora, sala, profesor, fechas).
 */
export function ScheduleSeriesRow({ entry }: Readonly<ScheduleSeriesRowProps>): React.JSX.Element {
  const theme = useTheme();
  const { series, day } = entry;
  const open = useOpenSeries(series.seriesId);
  const name = describeSeriesName(series);
  const timeRange = `${day.startsAtTime}–${day.endsAtTime}`;

  return (
    <View style={createScheduleCardStyle(theme)}>
      <Pressable
        role="button"
        accessibilityLabel={i18n.t('centerAdmin.schedules.rowLabel', { time: timeRange, name })}
        onPress={open.openDetail}
        style={createScheduleContentStyle(theme)}
      >
        <View style={createScheduleTimePillStyle(theme)}>
          <Icon name="clock" size="inline" color="brandInk" />
          <Text variant="bodyStrong" color="brandInk">
            {`${day.startsAtTime} – ${day.endsAtTime}`}
          </Text>
        </View>
        <Text variant="bodyStrong">{name}</Text>
        <Text variant="caption" color="ink2">
          {describeSeriesPlace(series)}
        </Text>
      </Pressable>
      <RowActions
        name={name}
        timeRange={timeRange}
        onWriteToClass={() => {
          open.writeToClass(name);
        }}
        onEdit={open.openEditor}
      />
    </View>
  );
}
