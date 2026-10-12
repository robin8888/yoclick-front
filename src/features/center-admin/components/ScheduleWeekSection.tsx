import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { getTodayIsoDate, getWeekdayOfIsoDate } from '@/shared/lib/format';
import { Chip } from '@/ui/atoms/Chip';
import { Text } from '@/ui/atoms/Text';

import { getDeviceTimeZone } from '../hooks/useCenterTimeZone';
import { useScheduleSeriesList } from '../hooks/useScheduleSeriesList';
import {
  describeWeekday,
  describeWeekdayInitial,
  SCHEDULE_WEEKDAYS,
  toScheduleWeekday,
  type ScheduleWeekday,
} from '../model/schedule-form';
import { listSeriesOfWeekday, type ScheduleSeries } from '../model/schedule-summary';
import { ScheduleSeriesRow } from './ScheduleSeriesRow';
import { SectionHeader } from './SectionHeader';

const SECTION_STYLE = { gap: 12 } as const;
const DAY_CHIPS_STYLE = { flexDirection: 'row', flexWrap: 'wrap', gap: 8 } as const;

function getTodayWeekday(): ScheduleWeekday {
  const today = getTodayIsoDate(new Date(), getDeviceTimeZone());
  return toScheduleWeekday(getWeekdayOfIsoDate(today) ?? 1) ?? 1;
}

interface WeekdayChipsProps {
  selectedWeekday: ScheduleWeekday;
  onWeekdaySelect: (weekday: ScheduleWeekday) => void;
}

function WeekdayChips({
  selectedWeekday,
  onWeekdaySelect,
}: Readonly<WeekdayChipsProps>): React.JSX.Element {
  return (
    <View style={DAY_CHIPS_STYLE}>
      {SCHEDULE_WEEKDAYS.map((weekday) => (
        <Chip
          key={weekday}
          label={describeWeekdayInitial(weekday)}
          accessibilityLabel={describeWeekday(weekday)}
          selectionRole="radio"
          isSelected={weekday === selectedWeekday}
          onPress={() => {
            onWeekdaySelect(weekday);
          }}
        />
      ))}
    </View>
  );
}

interface WeekdayRowsProps {
  seriesList: readonly ScheduleSeries[];
  weekday: ScheduleWeekday;
}

function WeekdayRows({ seriesList, weekday }: Readonly<WeekdayRowsProps>): React.JSX.Element {
  const entries = listSeriesOfWeekday(
    seriesList.filter((series) => series.status === 'active'),
    weekday,
  );

  if (entries.length === 0) {
    return (
      <Text color="ink2">
        {i18n.t('centerAdmin.schedules.emptyDay', { day: describeWeekday(weekday) })}
      </Text>
    );
  }
  return (
    <>
      {entries.map((entry) => (
        <ScheduleSeriesRow key={entry.day.scheduleId} entry={entry} />
      ))}
    </>
  );
}

/** «Horario fijo»: la semana por días, con cada clase fija y sus matriculados, y «Nuevo horario». */
export function ScheduleWeekSection(): React.JSX.Element {
  const router = useRouter();
  const seriesList = useScheduleSeriesList();
  const [selectedWeekday, setSelectedWeekday] = useState<ScheduleWeekday>(getTodayWeekday);

  return (
    <View style={SECTION_STYLE}>
      <SectionHeader
        title={i18n.t('centerAdmin.schedules.sectionTitle')}
        actionLabel={i18n.t('centerAdmin.schedules.addAction')}
        onActionPress={() => {
          router.push('/(admin)/schedules/new');
        }}
      />
      <WeekdayChips selectedWeekday={selectedWeekday} onWeekdaySelect={setSelectedWeekday} />
      {seriesList.isError ? (
        <Text color="danger" role="alert">
          {i18n.t('centerAdmin.schedules.loadError')}
        </Text>
      ) : null}
      {seriesList.data === undefined ? null : (
        <WeekdayRows seriesList={seriesList.data.series} weekday={selectedWeekday} />
      )}
    </View>
  );
}
