import { View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { qrCodeColors, useTheme } from '@/shared/theme';

import { createQrCardStyle, DEFAULT_QR_SIZE } from './QrCard.styles';
import type { QrCardProps } from './QrCard.types';

/** Un código QR sobre una tarjeta blanca con margen, legible por cualquier lector. */
export function QrCard({
  value,
  accessibilityLabel,
  size = DEFAULT_QR_SIZE,
}: Readonly<QrCardProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View accessible role="img" aria-label={accessibilityLabel} style={createQrCardStyle(theme)}>
      <QRCode
        value={value}
        size={size}
        color={qrCodeColors.foreground}
        backgroundColor={qrCodeColors.background}
      />
    </View>
  );
}
