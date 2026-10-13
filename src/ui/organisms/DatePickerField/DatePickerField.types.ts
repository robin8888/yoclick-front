import type { CalendarGridLabels } from '@/ui/molecules/CalendarGrid';

export interface DatePickerFieldProps {
  /** `AAAA-MM-DD`, o cadena vacía si aún no hay fecha elegida. */
  value: string;
  onValueChange: (isoDate: string) => void;
  /** `AAAA-MM-DD` → como se lee («23/11/2026»). */
  formatDate: (isoDate: string) => string;
  /** Obligatoria: el campo no dibuja etiqueta. */
  accessibilityLabel: string;
  /** Lo que se lee mientras no hay fecha elegida. */
  placeholder: string;
  /** Texto del botón que abre o cierra el calendario. */
  openCalendarLabel: string;
  /** El calendario sale abierto (por defecto) o solo la píldora con la fecha, para formularios con varias. */
  isInitiallyOpen?: boolean | undefined;
  /** Hoy, `AAAA-MM-DD`: su número va en el color de la marca. */
  todayDate?: string | undefined;
  /** El primer día que se puede elegir; los anteriores salen apagados. */
  minDate?: string | undefined;
  /** Los textos del calendario para el mes que se está viendo. */
  getCalendarLabels: (visibleMonth: { year: number; month: number }) => CalendarGridLabels;
}
