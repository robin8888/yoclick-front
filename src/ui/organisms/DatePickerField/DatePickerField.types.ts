import type { CalendarGridLabels } from '@/ui/molecules/CalendarGrid';

export interface DatePickerFieldProps {
  /** `AAAA-MM-DD`, o cadena vacía si aún no hay una fecha válida. */
  value: string;
  onValueChange: (isoDate: string) => void;
  /** `AAAA-MM-DD` → como se escribe («23/11/2026»). */
  formatDate: (isoDate: string) => string;
  /** Lo escrito → `AAAA-MM-DD`, o `null` si no es una fecha que exista. */
  parseDate: (text: string) => string | null;
  /** Obligatoria: el campo no dibuja etiqueta. */
  accessibilityLabel: string;
  placeholder: string;
  /** Texto del botón que abre el calendario. */
  openCalendarLabel: string;
  /** Los textos del calendario para el mes que se está viendo. */
  getCalendarLabels: (visibleMonth: { year: number; month: number }) => CalendarGridLabels;
}
