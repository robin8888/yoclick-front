import { useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { ListItem } from '@/ui/molecules/ListItem';

import {
  describeSeriesName,
  describeSeriesPlace,
  type SeriesOfDay,
} from '../model/schedule-summary';

interface ScheduleSeriesRowProps {
  entry: SeriesOfDay;
}

/** Un horario en la semana: «18:00–19:30 · Inglés B1» y dónde, con quién y cuántos matriculados. */
export function ScheduleSeriesRow({ entry }: Readonly<ScheduleSeriesRowProps>): React.JSX.Element {
  const router = useRouter();
  const { series, day } = entry;
  const timeRange = `${day.startsAtTime}–${day.endsAtTime}`;
  const name = describeSeriesName(series);

  return (
    <ListItem
      title={`${timeRange} · ${name}`}
      subtitle={describeSeriesPlace(series)}
      leadingIconName="calendar"
      accessibilityLabel={i18n.t('centerAdmin.schedules.rowLabel', { time: timeRange, name })}
      onPress={() => {
        router.push({
          pathname: '/(admin)/schedules/[seriesId]',
          params: { seriesId: series.seriesId },
        });
      }}
    />
  );
}
