export interface ChipProps {
  label: string;
  isSelected: boolean;
  /** `radio` cuando solo cabe una opción (un filtro); `checkbox` cuando se pueden marcar varias. */
  selectionRole?: 'radio' | 'checkbox';
  /** Etiqueta para el lector de pantalla si la visible no basta. */
  accessibilityLabel?: string | undefined;
  onPress: () => void;
}
