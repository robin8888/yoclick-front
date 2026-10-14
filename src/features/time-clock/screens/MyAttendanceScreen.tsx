import { useRouter } from 'expo-router';
import { useState } from 'react';

import { i18n } from '@/shared/i18n';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { AttendanceMonthBody } from '../components/AttendanceMonthBody';
import { MonthSwitcher } from '../components/MonthSwitcher';
import {
  TimeEntryEditorSheet,
  type TimeEntryEditorState,
} from '../components/TimeEntryEditorSheet';
import { CENTER_TIME_ZONE, useAttendanceMonth } from '../hooks/useAttendanceMonth';
import { formatMonthTitle } from '../model/month';

/** «Mi asistencia»: el mes de entradas y salidas, su corrección y el informe para el centro. */
export function MyAttendanceScreen(): React.JSX.Element {
  const router = useRouter();
  const month = useAttendanceMonth();
  const [editor, setEditor] = useState<TimeEntryEditorState>({ isOpen: false });

  return (
    <ScreenTemplate
      title={i18n.t('timeClock.title')}
      subtitle={i18n.t('timeClock.subtitle')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
    >
      <MonthSwitcher
        title={formatMonthTitle(month.monthId)}
        isLastMonth={month.isLastMonth}
        onPreviousPress={month.goToPreviousMonth}
        onNextPress={month.goToNextMonth}
      />
      <AttendanceMonthBody
        monthId={month.monthId}
        onEntryPress={(entry) => {
          setEditor({ isOpen: true, entry });
        }}
        onAddPress={() => {
          setEditor({ isOpen: true, entry: null });
        }}
      />
      <TimeEntryEditorSheet
        editor={editor}
        timeZone={CENTER_TIME_ZONE}
        todayIsoDate={month.todayIsoDate}
        onClose={() => {
          setEditor({ isOpen: false });
        }}
      />
    </ScreenTemplate>
  );
}
