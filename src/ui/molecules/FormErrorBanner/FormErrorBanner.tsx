import { View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import { BANNER_TEXT_STYLE, createBannerStyle } from './FormErrorBanner.styles';
import type { FormErrorBannerProps } from './FormErrorBanner.types';

/** Mensaje de resultado de un formulario: icono y texto, nunca solo el color de fondo. */
export function FormErrorBanner({
  message,
  tone = 'error',
}: Readonly<FormErrorBannerProps>): React.JSX.Element {
  const theme = useTheme();
  const isError = tone === 'error';
  const contentColor = isError ? 'danger' : 'success';

  return (
    <View accessible role={isError ? 'alert' : undefined} style={createBannerStyle(theme, tone)}>
      <Icon name={isError ? 'alertTriangle' : 'checkCircle'} color={contentColor} />
      <View style={BANNER_TEXT_STYLE}>
        <Text variant="body" color={contentColor}>
          {message}
        </Text>
      </View>
    </View>
  );
}
