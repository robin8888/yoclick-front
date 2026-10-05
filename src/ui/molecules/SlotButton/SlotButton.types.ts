export interface SlotButtonProps {
  /** Hora de inicio en 24 h, p. ej. «18:00». */
  timeLabel: string;
  isSelected: boolean;
  onPress: () => void;
}
