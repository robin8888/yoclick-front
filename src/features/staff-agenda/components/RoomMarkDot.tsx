import { View } from 'react-native';

import { pickRoomPaletteColor } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import type { RoomMark } from '../model/room-marks';
import { createRoomDotStyle, type RoomDotSize } from './RoomDayGrid.styles';

interface RoomMarkDotProps {
  mark: RoomMark;
  /** `md` lleva la letra dentro; `sm` es solo el punto de color (franja de la semana). */
  size?: RoomDotSize;
}

/** El punto de color de una sala, con su letra: el color nunca va solo. */
export function RoomMarkDot({ mark, size = 'md' }: Readonly<RoomMarkDotProps>): React.JSX.Element {
  const color = pickRoomPaletteColor(mark.paletteIndex);

  return (
    <View style={createRoomDotStyle(color, size)} accessibilityElementsHidden>
      {size === 'md' ? (
        <Text variant="caption" tintColor={color.text}>
          {mark.letter}
        </Text>
      ) : null}
    </View>
  );
}
