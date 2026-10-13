import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { getTodayIsoDate, getWeekdayOfIsoDate } from '@/shared/lib/format';
import { getProblemModalCopy } from '@/shared/i18n/problem-modal-copy';
import { Text } from '@/ui/atoms/Text';
import { ProblemModal } from '@/ui/organisms/ProblemModal';

import { getDeviceTimeZone } from '../hooks/useCenterTimeZone';
import { useRepeatWeek } from '../hooks/useRepeatWeek';
import { useScheduleSeriesList } from '../hooks/useScheduleSeriesList';
import {
  describeWeekday,
  SCHEDULE_WEEKDAYS,
  toScheduleWeekday,
  type ScheduleWeekday,
} from '../model/schedule-form';
import { listSeriesOfWeekday, type ScheduleSeries } from '../model/schedule-summary';
import {
  getWeekStart,
  listSeriesBoundToWeek,
  listSeriesOfWeek,
  shiftWeek,
} from '../model/schedule-week';
import { ScheduleSeriesRow } from './ScheduleSeriesRow';
import { SectionHeader } from './SectionHeader';
import { WeekdayTabs } from './WeekdayTabs';
import { WeekRepeatPanel } from './WeekRepeatPanel';

const SECTION_STYLE = { gap: 12 } as const;

function getTodayWeekday(): ScheduleWeekday {
  const today = getTodayIsoDate(new Date(), getDeviceTimeZone());
  return toScheduleWeekday(getWeekdayOfIsoDate(today) ?? 1) ?? 1;
}

function getCurrentWeekStart(): string {
  return getWeekStart(getTodayIsoDate(new Date(), getDeviceTimeZone()));
}

function listActiveSeries(seriesList: readonly ScheduleSeries[]): ScheduleSeries[] {
  return seriesList.filter((series) => series.status === 'active');
}

/** Los días de la semana con alguna clase fija activa (llevan un punto en la barra). */
function listBusyWeekdays(seriesList: readonly ScheduleSeries[]): Set<ScheduleWeekday> {
  const activeSeries = listActiveSeries(seriesList);
  return new Set(
    SCHEDULE_WEEKDAYS.filter((weekday) => listSeriesOfWeekday(activeSeries, weekday).length > 0),
  );
}

interface WeekdayRowsProps {
  seriesList: readonly ScheduleSeries[];
  weekday: ScheduleWeekday;
}

function WeekdayRows({ seriesList, weekday }: Readonly<WeekdayRowsProps>): React.JSX.Element {
  const entries = listSeriesOfWeekday(listActiveSeries(seriesList), weekday);

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

interface WeekControlsProps {
  weekStart: string;
  series: readonly ScheduleSeries[];
  onWeekStartChange: (weekStart: string) => void;
}

/** El selector de semana y «Repetir en la semana siguiente», conectado a la copia del servidor. */
function WeekControls({
  weekStart,
  series,
  onWeekStartChange,
}: Readonly<WeekControlsProps>): React.JSX.Element {
  const repetition = useRepeatWeek();

  return (
    <>
      <WeekRepeatPanel
        weekStart={weekStart}
        copyableSeriesCount={listSeriesBoundToWeek(series, weekStart).length}
        isRepeating={repetition.isRepeating}
        result={repetition.result}
        onPreviousWeek={() => {
          onWeekStartChange(shiftWeek(weekStart, -1));
        }}
        onNextWeek={() => {
          onWeekStartChange(shiftWeek(weekStart, 1));
        }}
        onRepeat={() => {
          repetition.repeatWeek(weekStart);
        }}
      />
      <ProblemModal
        message={repetition.errorMessage}
        onDismiss={repetition.clearError}
        {...getProblemModalCopy()}
      />
    </>
  );
}

/** «Horario fijo»: la semana elegida por días, con cada clase y sus matriculados, y «Nuevo horario». */
export function ScheduleWeekSection(): React.JSX.Element {
  const router = useRouter();
  const seriesList = useScheduleSeriesList();
  const [selectedWeekday, setSelectedWeekday] = useState<ScheduleWeekday>(getTodayWeekday);
  const [weekStart, setWeekStart] = useState(getCurrentWeekStart);
  const series = seriesList.data?.series ?? [];
  const seriesOfWeek = listSeriesOfWeek(series, weekStart);

  return (
    <View style={SECTION_STYLE}>
      <SectionHeader
        title={i18n.t('centerAdmin.schedules.sectionTitle')}
        actionLabel={i18n.t('centerAdmin.schedules.addAction')}
        onActionPress={() => {
          router.push('/(admin)/schedules/new');
        }}
      />
      <WeekControls weekStart={weekStart} series={series} onWeekStartChange={setWeekStart} />
      <WeekdayTabs
        selectedWeekday={selectedWeekday}
        busyWeekdays={listBusyWeekdays(seriesOfWeek)}
        onWeekdaySelect={setSelectedWeekday}
      />
      {seriesList.isError ? (
        <Text color="danger" role="alert">
          {i18n.t('centerAdmin.schedules.loadError')}
        </Text>
      ) : null}
      {seriesList.data === undefined ? null : (
        <WeekdayRows seriesList={seriesOfWeek} weekday={selectedWeekday} />
      )}
    </View>
  );
}
