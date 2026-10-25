import { View } from 'react-native';

import { useTheme } from '@/shared/theme';

import type { CapUsage } from '../model/client-cap-usage';
import { createMeterFillStyle, createMeterTrackStyle } from './ClientCapMeter.styles';

interface ClientCapMeterProps {
  usage: CapUsage;
}

/** Barra del tope de clientes. Es solo apoyo visual: la cifra y el aviso con palabra van en el texto. */
export function ClientCapMeter({ usage }: Readonly<ClientCapMeterProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createMeterTrackStyle(theme)} accessibilityElementsHidden>
      <View style={createMeterFillStyle(theme, usage)} />
    </View>
  );
}
