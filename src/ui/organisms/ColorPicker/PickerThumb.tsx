import { View } from 'react-native';

import { useTheme } from '@/shared/theme';

import { createThumbStyle, THUMB_RADIUS } from './ColorPicker.styles';

interface PickerThumbProps {
  /** El color que lleva dentro el tirador, para ver lo que se está eligiendo. */
  fillColor: string;
  /** Posición de 0 a 1 dentro de la superficie. */
  horizontal: number;
  vertical: number;
  surfaceSize: { width: number; height: number };
}

/** El tirador redondo que marca el color elegido sobre el cuadrado o la barra de tono. */
export function PickerThumb({
  fillColor,
  horizontal,
  vertical,
  surfaceSize,
}: Readonly<PickerThumbProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View
      pointerEvents="none"
      style={[
        createThumbStyle(theme, fillColor),
        {
          left: horizontal * surfaceSize.width - THUMB_RADIUS,
          top: vertical * surfaceSize.height - THUMB_RADIUS,
        },
      ]}
    />
  );
}
