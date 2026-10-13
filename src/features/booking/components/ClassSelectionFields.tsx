import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';

import type { ClassSelection } from '../hooks/useClassSelection';
import { ClassDayCalendar } from './ClassDayCalendar';
import { ClassSessionList } from './ClassSessionList';

/**
 * El calendario (con aro en los días ya elegidos) y las clases del día enfocado: se elige una por
 * día y se van sumando hasta completar las clases del bono.
 */
export function ClassSelectionFields({
  selection,
}: Readonly<{ selection: ClassSelection }>): React.JSX.Element {
  const { choice } = selection;
  // Si ya no caben más días, solo se puede cambiar la clase de un día ya elegido.
  const canPickAnotherDay = !selection.isLimitReached || selection.pickedClassOfDay !== null;

  return (
    <>
      <ClassDayCalendar
        enabledDates={choice.enabledDates}
        markedDates={selection.pickedDates}
        selectedIsoDate={choice.selectedDate}
        todayIsoDate={choice.todayIsoDate}
        onDaySelect={choice.selectDate}
      />
      <Text variant="titleMd">{i18n.t('booking.slot.classesLabel')}</Text>
      {selection.maxSelections === 0 ? (
        <Text color="ink2">{i18n.t('booking.slot.noClassesLeftHint')}</Text>
      ) : null}
      {canPickAnotherDay || selection.maxSelections === 0 ? null : (
        <Text color="ink2">{i18n.t('booking.slot.limitReachedHint')}</Text>
      )}
      <ClassSessionList
        sessions={choice.classesOfDay}
        timeZone={choice.timeZone}
        selectedSessionId={selection.pickedClassOfDay?.id ?? null}
        onSessionSelect={selection.togglePickedClass}
      />
    </>
  );
}
