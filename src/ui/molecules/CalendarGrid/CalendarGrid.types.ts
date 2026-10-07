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
  onDateSelect: (isoDate: string) => void;
  labels: CalendarGridLabels;
}
