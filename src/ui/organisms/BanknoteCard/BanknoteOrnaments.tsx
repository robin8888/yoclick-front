import { View } from 'react-native';

import { useTheme } from '@/shared/theme';

import {
  createBanknoteCornerStyle,
  createBanknoteFrameStyle,
  createBanknoteInnerFrameStyle,
  createBanknoteEndStripStyle,
  createBanknoteStartStripStyle,
  type BanknoteColors,
} from './BanknoteCard.styles';

const CORNER_PLACEMENTS = [
  { isTop: true, isStart: true },
  { isTop: true, isStart: false },
  { isTop: false, isStart: true },
  { isTop: false, isStart: false },
] as const;

interface BanknoteOrnamentsProps {
  colors: BanknoteColors;
}

/**
 * La orla impresa del billete: banda de seguridad al borde, marco doble y un medallón en cada
 * esquina. Todo decorativo y de dibujo: no lo lee el lector de pantalla.
 */
export function BanknoteOrnaments({ colors }: Readonly<BanknoteOrnamentsProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <>
      <View style={createBanknoteStartStripStyle(colors)} pointerEvents="none" />
      <View style={createBanknoteEndStripStyle(colors)} pointerEvents="none" />
      <View style={createBanknoteFrameStyle(theme, colors)} pointerEvents="none" />
      <View style={createBanknoteInnerFrameStyle(theme, colors)} pointerEvents="none" />
      {CORNER_PLACEMENTS.map((placement) => (
        <View
          key={`${placement.isTop ? 'top' : 'bottom'}-${placement.isStart ? 'start' : 'end'}`}
          style={createBanknoteCornerStyle(colors, placement)}
          pointerEvents="none"
        />
      ))}
    </>
  );
}
