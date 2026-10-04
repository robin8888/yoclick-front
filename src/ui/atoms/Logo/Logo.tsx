import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import {
  useTheme,
  YOCLICK_LOGO_ASPECT_RATIO,
  YOCLICK_LOGO_MARKUP,
  type ThemeMode,
} from '@/shared/theme';

import type { LogoProps } from './Logo.types';

const LOGO_ACCESSIBLE_NAME = 'YoClick';

function selectLogoMarkup(variant: LogoProps['variant'], mode: ThemeMode): string {
  if (variant === 'symbol') return YOCLICK_LOGO_MARKUP.symbol;
  return mode === 'dark' ? YOCLICK_LOGO_MARKUP.wordmarkDark : YOCLICK_LOGO_MARKUP.wordmarkLight;
}

/** Logotipo de la plataforma. Solo para pantallas con marca Yoclick (antes de unirse a un centro). */
export function Logo({ variant, height }: Readonly<LogoProps>): React.JSX.Element {
  const { mode } = useTheme();
  const width = height * YOCLICK_LOGO_ASPECT_RATIO[variant];
  const markup = selectLogoMarkup(variant, mode);

  return (
    <View accessible role="img" aria-label={LOGO_ACCESSIBLE_NAME}>
      <SvgXml xml={markup} width={width} height={height} />
    </View>
  );
}
