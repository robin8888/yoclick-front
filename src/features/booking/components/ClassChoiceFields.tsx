import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';

import type { ClassChoice } from '../hooks/useClassChoice';
import { ClassDayCalendar } from './ClassDayCalendar';
import { ClassSessionList } from './ClassSessionList';

/** El calendario con los días que tienen clase y, debajo, las clases del día elegido. */
export function ClassChoiceFields({
  choice,
}: Readonly<{ choice: ClassChoice }>): React.JSX.Element {
  return (
    <>
      <ClassDayCalendar
        enabledDates={choice.enabledDates}
        selectedIsoDate={choice.selectedDate}
        todayIsoDate={choice.todayIsoDate}
        onDaySelect={choice.selectDate}
      />
      <Text variant="titleMd">{i18n.t('booking.slot.classesLabel')}</Text>
      <ClassSessionList
        sessions={choice.classesOfDay}
        timeZone={choice.timeZone}
        selectedSessionId={choice.selectedClass?.id ?? null}
        onSessionSelect={choice.selectClass}
      />
    </>
  );
}
