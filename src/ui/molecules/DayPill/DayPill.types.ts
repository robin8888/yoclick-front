export interface DayPillProps {
  /** «jue» */
  weekdayLabel: string;
  /** «1» */
  dayLabel: string;
  /** Nombre completo para el lector de pantalla: «jueves 1 de octubre». */
  accessibilityLabel: string;
  isSelected: boolean;
  /** Color del día elegido: el de la marca (reservas) o negro (agenda del profesional). */
  selectedTone?: 'brand' | 'ink';
  /** Sin huecos el día no se puede elegir y lo dice con palabra, no solo con color. */
  hasSlots: boolean;
  onPress: () => void;
}
