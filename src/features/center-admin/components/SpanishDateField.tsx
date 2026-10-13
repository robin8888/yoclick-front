import { useState } from 'react';

import { i18n } from '@/shared/i18n';
import { buildCalendarLabels } from '@/shared/i18n/calendar-labels';
import { formatNumericDate, getTodayIsoDate } from '@/shared/lib/format';
import { DatePickerField } from '@/ui/organisms/DatePickerField';

import { getDeviceTimeZone } from '../hooks/useCenterTimeZone';

interface SpanishDateFieldProps {
  /** `AAAA-MM-DD`, o cadena vacía si aún no hay fecha. */
  value: string;
  onValueChange: (isoDate: string) => void;
  accessibilityLabel: string;
  /** El calendario sale abierto (por defecto) o cerrado tras la fecha, si el formulario tiene varias. */
  isInitiallyOpen?: boolean | undefined;
}

/** Una fecha elegida en el calendario del iPhone, en español y sin poder elegir días pasados. */
export function SpanishDateField({
  value,
  onValueChange,
  accessibilityLabel,
  isInitiallyOpen,
}: Readonly<SpanishDateFieldProps>): React.JSX.Element {
  const [todayIsoDate] = useState(() => getTodayIsoDate(new Date(), getDeviceTimeZone()));

  return (
    <DatePickerField
      value={value}
      onValueChange={onValueChange}
      accessibilityLabel={accessibilityLabel}
      isInitiallyOpen={isInitiallyOpen}
      placeholder={i18n.t('calendar.datePlaceholder')}
      openCalendarLabel={i18n.t('calendar.openCalendar')}
      formatDate={formatNumericDate}
      todayDate={todayIsoDate}
      minDate={todayIsoDate}
      getCalendarLabels={buildCalendarLabels}
    />
  );
}
