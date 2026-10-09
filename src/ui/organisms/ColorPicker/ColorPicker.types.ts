export interface ColorPickerProps {
  /** El color actual como `#RRGGBB`; si no es un color completo se parte de gris. */
  value: string;
  onValueChange: (hexColor: string) => void;
  /** Para el lector de pantalla: qué color se está eligiendo («Color de la marca»). */
  accessibilityLabel: string;
}
