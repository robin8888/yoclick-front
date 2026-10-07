import { i18n } from '@/shared/i18n';
import { buildCalendarLabels } from '@/shared/i18n/calendar-labels';
import { formatNumericDate, parseNumericDate } from '@/shared/lib/format';
import { DatePickerField } from '@/ui/organisms/DatePickerField';

interface SpanishDateFieldProps {
  /** `AAAA-MM-DD`, o cadena vacía si aún no hay una fecha válida. */
  value: string;
  onValueChange: (isoDate: string) => void;
  accessibilityLabel: string;
}

/** Fecha escrita como `23/11/2026` o elegida en el calendario, con los textos en español. */
export function SpanishDateField({
  value,
  onValueChange,
  accessibilityLabel,
}: Readonly<SpanishDateFieldProps>): React.JSX.Element {
  return (
    <DatePickerField
      value={value}
      onValueChange={onValueChange}
      accessibilityLabel={accessibilityLabel}
      placeholder={i18n.t('calendar.datePlaceholder')}
      openCalendarLabel={i18n.t('calendar.openCalendar')}
      formatDate={formatNumericDate}
      parseDate={parseNumericDate}
      getCalendarLabels={buildCalendarLabels}
    />
  );
}
