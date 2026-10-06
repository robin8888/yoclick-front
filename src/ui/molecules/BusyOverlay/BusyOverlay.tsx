import { Pressable, StyleSheet, View } from 'react-native';

import { platformAccentColors, useTheme } from '@/shared/theme';
import { LogoLoader } from '@/ui/atoms/LogoLoader';

import { BUSY_LOGO_HEIGHT, createBusyOverlayStyle } from './BusyOverlay.styles';

interface BusyOverlayProps {
  loadingLabel: string | undefined;
}

/**
 * Velo con el logotipo animado en medio de la pantalla mientras se envía algo. Cubre y captura
 * los toques para que no se pueda enviar dos veces ni tocar el formulario a medias.
 */
export function BusyOverlay({ loadingLabel }: Readonly<BusyOverlayProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <Pressable accessible={false} style={[StyleSheet.absoluteFill, createBusyOverlayStyle(theme)]}>
      <View>
        <LogoLoader
          height={BUSY_LOGO_HEIGHT}
          tintColor={platformAccentColors.icon}
          accessibilityLabel={loadingLabel}
        />
      </View>
    </Pressable>
  );
}
