import { BlurView } from 'expo-blur';
import { requireOptionalNativeModule } from 'expo-modules-core';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { useTheme } from '@/shared/theme';

import { TAB_BAR_BLUR_INTENSITY } from './TabBar.styles';

/** Una app instalada antes de añadir `expo-blur` no lleva su módulo nativo: pintar el desenfoque la rompería. */
const isBlurAvailable = requireOptionalNativeModule<object>('ExpoBlur') !== null;
const FALLBACK_OPACITY = 0.85;

/** El cristal de la barra: contenido desenfocado detrás o, sin el módulo nativo, un fondo liso casi opaco. */
export function TabBarGlass(): React.JSX.Element {
  const theme = useTheme();
  if (!isBlurAvailable) {
    const fallbackStyle: ViewStyle = {
      ...StyleSheet.flatten(StyleSheet.absoluteFill),
      backgroundColor: theme.colors.surface,
      opacity: FALLBACK_OPACITY,
    };
    return <View style={fallbackStyle} />;
  }
  return (
    // Sin `blurMethod`, Android dibuja un velo en vez de desenfocar.
    <BlurView
      blurMethod="dimezisBlurViewSdk31Plus"
      intensity={TAB_BAR_BLUR_INTENSITY}
      tint={theme.mode === 'dark' ? 'systemUltraThinMaterialDark' : 'systemUltraThinMaterialLight'}
      style={StyleSheet.absoluteFill}
    />
  );
}
