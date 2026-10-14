import { View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import {
  createBanknoteIssuerBandStyle,
  createBanknoteNumeralStyle,
  createBanknotePortraitStyle,
  createBanknoteSealInnerStyle,
  createBanknoteSealStyle,
  BANKNOTE_FOOTER_STYLE,
  type BanknoteColors,
} from './BanknoteCard.styles';

interface BanknoteColorsProps {
  colors: BanknoteColors;
}

interface BanknoteIssuerBandProps extends BanknoteColorsProps {
  issuerName: string;
}

/** El nombre de la academia en una banda con rótulo, como «Federal Reserve Note». */
export function BanknoteIssuerBand({
  issuerName,
  colors,
}: Readonly<BanknoteIssuerBandProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createBanknoteIssuerBandStyle(theme, colors)}>
      <Text variant="overline" color="ink" numberOfLines={1}>
        {issuerName.toLocaleUpperCase('es-ES')}
      </Text>
    </View>
  );
}

interface BanknoteSealProps extends BanknoteColorsProps {
  stampText: string;
}

/** El sello redondo con el estado en palabra («Activo»), a la izquierda de la cifra. */
export function BanknoteSeal({
  stampText,
  colors,
}: Readonly<BanknoteSealProps>): React.JSX.Element {
  return (
    <View style={createBanknoteSealStyle(colors)}>
      <View style={createBanknoteSealInnerStyle(colors)}>
        <Text variant="caption" color="ink" numberOfLines={2} align="center">
          {stampText}
        </Text>
      </View>
    </View>
  );
}

/** El óvalo central: lleva dentro el logo del centro como marca de agua. */
export function BanknotePortrait({
  colors,
  children,
}: Readonly<BanknoteColorsProps & { children?: React.ReactNode }>): React.JSX.Element {
  return <View style={createBanknotePortraitStyle(colors)}>{children}</View>;
}

interface BanknoteFooterProps extends BanknoteColorsProps {
  serialText: string;
  valueText: string;
  isMuted: boolean;
}

/** El pie: número de serie en verde, como el del dólar, y la cifra en su recuadro. */
export function BanknoteFooter({
  serialText,
  valueText,
  isMuted,
  colors,
}: Readonly<BanknoteFooterProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={BANKNOTE_FOOTER_STYLE}>
      <Text variant="bodyStrong" color={isMuted ? 'ink2' : 'success'}>
        {serialText}
      </Text>
      <View style={createBanknoteNumeralStyle(theme, colors)}>
        <Text variant="bodyStrong" color={isMuted ? 'ink2' : 'brandInk'}>
          {valueText}
        </Text>
      </View>
    </View>
  );
}
