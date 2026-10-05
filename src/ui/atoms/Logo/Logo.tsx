import { Image } from 'expo-image';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import {
  useTheme,
  YOCLICK_LOGO_ASPECT_RATIO,
  YOCLICK_LOGO_MARKUP,
  type ThemeMode,
} from '@/shared/theme';

import lockupSource from '../../../../assets/brand/yoclick-logo-white.png';
import type { LogoProps } from './Logo.types';

const LOGO_ACCESSIBLE_NAME = 'YoClick';
// Medidas del PNG recortado.
const LOCKUP_WIDTH_PIXELS = 720;
const LOCKUP_HEIGHT_PIXELS = 697;
const LOCKUP_ASPECT_RATIO = LOCKUP_WIDTH_PIXELS / LOCKUP_HEIGHT_PIXELS;

function selectLogoMarkup(variant: LogoProps['variant'], mode: ThemeMode): string {
  if (variant === 'symbol') return YOCLICK_LOGO_MARKUP.symbol;
  return mode === 'dark' ? YOCLICK_LOGO_MARKUP.wordmarkDark : YOCLICK_LOGO_MARKUP.wordmarkLight;
}

/** Logotipo de la plataforma. Solo para pantallas con marca Yoclick (antes de unirse a un centro). */
export function Logo({ variant, height }: Readonly<LogoProps>): React.JSX.Element {
  const { mode } = useTheme();
  if (variant === 'lockup') {
    return (
      <Image
        source={lockupSource}
        accessible
        role="img"
        accessibilityLabel={LOGO_ACCESSIBLE_NAME}
        contentFit="contain"
        style={{ width: height * LOCKUP_ASPECT_RATIO, height }}
      />
    );
  }
  const width = height * YOCLICK_LOGO_ASPECT_RATIO[variant];
  const markup = selectLogoMarkup(variant, mode);

  return (
    <View accessible role="img" aria-label={LOGO_ACCESSIBLE_NAME}>
      <SvgXml xml={markup} width={width} height={height} />
    </View>
  );
}
