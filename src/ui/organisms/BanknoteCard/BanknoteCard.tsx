import { Pressable, View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import {
  BanknoteFooter,
  BanknoteIssuerBand,
  BanknotePortrait,
  BanknoteSeal,
} from './BanknoteFaceParts';
import { BanknoteOrnaments } from './BanknoteOrnaments';
import { BanknotePattern } from './BanknotePattern';
import { BanknoteWatermark } from './BanknoteWatermark';
import {
  BANKNOTE_MIDDLE_ROW_STYLE,
  BANKNOTE_SEAL_COLUMN_STYLE,
  BANKNOTE_VALUE_COLUMN_STYLE,
  createBanknoteActionsStyle,
  createBanknoteBodyStyle,
  createBanknoteStyle,
  resolveBanknoteColors,
  type BanknoteColors,
} from './BanknoteCard.styles';
import type { BanknoteCardProps } from './BanknoteCard.types';

interface BanknoteValueProps {
  valueText: string;
  unitText: string;
  isMuted: boolean;
}

/** La cifra grande y su unidad («6 de 10 clases»); apagada en un bono agotado o caducado. */
function BanknoteValue({
  valueText,
  unitText,
  isMuted,
}: Readonly<BanknoteValueProps>): React.JSX.Element {
  return (
    <View style={BANKNOTE_VALUE_COLUMN_STYLE}>
      <Text variant="display" color={isMuted ? 'ink2' : 'brandInk'}>
        {valueText}
      </Text>
      <Text variant="bodyStrong" color="ink2" align="center">
        {unitText}
      </Text>
    </View>
  );
}

type BanknoteMiddleRowProps = Pick<
  BanknoteCardProps,
  'valueText' | 'unitText' | 'stampText' | 'watermark'
> & { colors: BanknoteColors; isMuted: boolean };

/** El centro del billete: sello del estado a la izquierda, óvalo con el logo y la cifra a la derecha. */
function BanknoteMiddleRow({
  valueText,
  unitText,
  stampText,
  watermark,
  colors,
  isMuted,
}: Readonly<BanknoteMiddleRowProps>): React.JSX.Element {
  return (
    <View style={BANKNOTE_MIDDLE_ROW_STYLE}>
      <View style={BANKNOTE_SEAL_COLUMN_STYLE}>
        <BanknoteSeal stampText={stampText} colors={colors} />
      </View>
      <BanknotePortrait colors={colors}>
        {watermark === undefined ? null : <BanknoteWatermark {...watermark} />}
      </BanknotePortrait>
      <BanknoteValue valueText={valueText} unitText={unitText} isMuted={isMuted} />
    </View>
  );
}

/** La leyenda bajo el centro, como «This note is legal tender»: caducidad y servicios. */
function BanknoteLegend({ lines }: Readonly<{ lines: readonly string[] }>): React.JSX.Element {
  return (
    <>
      {lines.map((line) => (
        <Text key={line} variant="caption" color="ink2" align="center" numberOfLines={2}>
          {line}
        </Text>
      ))}
    </>
  );
}

type BanknoteFaceProps = Pick<
  BanknoteCardProps,
  'title' | 'valueText' | 'unitText' | 'detailLines' | 'serialText' | 'stampText' | 'watermark'
> & { colors: BanknoteColors; isMuted: boolean };

/**
 * El anverso, ordenado como un dólar: rótulo con la academia, nombre del bono, y en el centro el
 * sello del estado, el óvalo con el logo y la cifra; abajo, la leyenda y el número de serie.
 */
function BanknoteFace({
  title,
  detailLines,
  serialText,
  watermark,
  colors,
  isMuted,
  ...valueProps
}: Readonly<BanknoteFaceProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <>
      <BanknotePattern strokeColor={colors.accent} />
      <BanknoteOrnaments colors={colors} />
      <View style={createBanknoteBodyStyle(theme)}>
        {watermark === undefined ? null : (
          <BanknoteIssuerBand issuerName={watermark.centerName} colors={colors} />
        )}
        <Text variant="titleMd" color="ink" align="center" numberOfLines={1}>
          {title}
        </Text>
        <BanknoteMiddleRow
          {...valueProps}
          watermark={watermark}
          colors={colors}
          isMuted={isMuted}
        />
        <BanknoteLegend lines={detailLines} />
        <BanknoteFooter
          serialText={serialText}
          valueText={valueProps.valueText}
          isMuted={isMuted}
          colors={colors}
        />
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
