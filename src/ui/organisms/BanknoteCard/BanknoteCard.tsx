import { Pressable, View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import { BanknotePattern } from './BanknotePattern';
import { BanknoteWatermark } from './BanknoteWatermark';
import {
  BANKNOTE_FOOTER_STYLE,
  BANKNOTE_HEADER_STYLE,
  BANKNOTE_TITLE_STYLE,
  BANKNOTE_VALUE_ROW_STYLE,
  createBanknoteActionsStyle,
  createBanknoteBodyStyle,
  createBanknoteFrameStyle,
  createBanknoteStampStyle,
  createBanknoteStyle,
  resolveBanknoteColors,
  type BanknoteColors,
} from './BanknoteCard.styles';
import type { BanknoteCardProps } from './BanknoteCard.types';

interface BanknoteHeaderProps {
  title: string;
  stampText: string;
  colors: BanknoteColors;
}

/** Arriba: el nombre del bono a la izquierda y el sello a la derecha. */
function BanknoteHeader({
  title,
  stampText,
  colors,
}: Readonly<BanknoteHeaderProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={BANKNOTE_HEADER_STYLE}>
      <View style={BANKNOTE_TITLE_STYLE}>
        <Text variant="bodyStrong" color="ink" numberOfLines={1}>
          {title}
        </Text>
      </View>
      <View style={createBanknoteStampStyle(theme, colors)}>
        <Text variant="caption" color="ink">
          {stampText}
        </Text>
      </View>
    </View>
  );
}

interface BanknoteValueProps {
  valueText: string;
  unitText: string;
  isMuted: boolean;
}

/** La cifra grande y su unidad («6 clases»); apagada en un bono agotado o caducado. */
function BanknoteValue({
  valueText,
  unitText,
  isMuted,
}: Readonly<BanknoteValueProps>): React.JSX.Element {
  return (
    <View style={BANKNOTE_VALUE_ROW_STYLE}>
      <Text variant="display" color={isMuted ? 'ink2' : 'brandInk'}>
        {valueText}
      </Text>
      <Text variant="bodyStrong" color="ink2">
        {unitText}
      </Text>
    </View>
  );
}

type BanknoteFaceProps = Pick<
  BanknoteCardProps,
  'title' | 'valueText' | 'unitText' | 'detailLines' | 'serialText' | 'stampText' | 'watermark'
> & { colors: BanknoteColors; isMuted: boolean };

/** El anverso del billete: rejilla, marco, cabecera, cifra grande, detalles y número de serie. */
function BanknoteFace({
  title,
  valueText,
  unitText,
  detailLines,
  serialText,
  stampText,
  watermark,
  colors,
  isMuted,
}: Readonly<BanknoteFaceProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <>
      <BanknotePattern strokeColor={colors.accent} />
      {watermark === undefined ? null : <BanknoteWatermark {...watermark} />}
      <View style={createBanknoteFrameStyle(theme, colors)} />
      <View style={createBanknoteBodyStyle(theme)}>
        <BanknoteHeader title={title} stampText={stampText} colors={colors} />
        <BanknoteValue valueText={valueText} unitText={unitText} isMuted={isMuted} />
        {detailLines.map((line) => (
          <Text key={line} variant="caption" color="ink2">
            {line}
          </Text>
        ))}
        <View style={BANKNOTE_FOOTER_STYLE}>
          <Text variant="caption" color="ink2">
            {serialText}
          </Text>
        </View>
      </View>
    </>
  );
}

/**
 * Un bono con aspecto de billete: papel de color suave, rejilla y roseta de seguridad, marco
 * interior, cifra grande, sello y número de serie. Lo decorativo se lee como una sola cosa con
 * `accessibilityLabel`; las acciones (`children`) van en una franja aparte, bajo el billete.
 */
export function BanknoteCard({
  tone = 'active',
  accessibilityLabel,
  onPress,
  children,
  ...faceProps
}: Readonly<BanknoteCardProps>): React.JSX.Element {
  const theme = useTheme();
  const colors = resolveBanknoteColors(theme, tone);
  const face = <BanknoteFace {...faceProps} colors={colors} isMuted={tone === 'inactive'} />;

  return (
    <View style={createBanknoteStyle(theme, colors)}>
      {onPress === undefined ? (
        <View accessible accessibilityLabel={accessibilityLabel}>
          {face}
        </View>
      ) : (
        <Pressable role="button" accessibilityLabel={accessibilityLabel} onPress={onPress}>
          {face}
        </Pressable>
      )}
      {children === undefined ? null : (
        <View style={createBanknoteActionsStyle(theme, colors)}>{children}</View>
      )}
    </View>
  );
}
