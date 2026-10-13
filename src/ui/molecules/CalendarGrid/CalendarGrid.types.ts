export interface CalendarGridLabels {
  /** «noviembre de 2026». */
  monthTitle: string;
  previousMonth: string;
  nextMonth: string;
  /** Lunes a domingo, abreviados («L», «M», «X»…). */
  weekdayInitials: readonly string[];
  /** Cómo se anuncia un día al lector de pantalla («23 de noviembre de 2026»). */
  describeDay: (isoDate: string) => string;
}

export interface CalendarGridProps {
  /** Mes que se muestra. */
  visibleMonth: { year: number; month: number };
  onVisibleMonthChange: (month: { year: number; month: number }) => void;
  /** Día elegido, `AAAA-MM-DD`, o cadena vacía. */
  selectedDate: string;
  /** Hoy, `AAAA-MM-DD`: su número va en el color de la marca, como en el calendario del iPhone. */
  todayDate?: string | undefined;
  /** El primer día que se puede elegir, `AAAA-MM-DD`; los anteriores salen apagados y no se pulsan. */
  minDate?: string | undefined;
  /** Si se indica, solo estos días se pueden elegir (los de una lista de clases); el resto sale apagado. */
  enabledDates?: ReadonlySet<string> | undefined;
  /** Días ya elegidos en una selección de varios: llevan un aro de marca además del día enfocado. */
  markedDates?: ReadonlySet<string> | undefined;
  onDateSelect: (isoDate: string) => void;
  labels: CalendarGridLabels;
}
