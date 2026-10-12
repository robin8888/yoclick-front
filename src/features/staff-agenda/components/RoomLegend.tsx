import { Pressable, View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import type { RoomMark } from '../model/room-marks';
import { CHIP_TEXT_STYLE, createChipStyle, WRAP_ROW_STYLE } from './RoomDayGrid.styles';
import { RoomMarkDot } from './RoomMarkDot';

interface RoomLegendProps {
  marks: readonly RoomMark[];
  /** La sala a la que se ha filtrado la rejilla; `null` = todas. */
  selectedRoomId: string | null;
  onRoomSelect: (roomId: string | null) => void;
}

/** «A Sala 1 · B Aula 2 …»: qué letra y color es cada sala; al pulsar una se ve solo esa. */
export function RoomLegend({
  marks,
  selectedRoomId,
  onRoomSelect,
}: Readonly<RoomLegendProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={WRAP_ROW_STYLE}>
      {marks.map((mark) => {
        const isSelected = mark.roomId === selectedRoomId;
        return (
          <Pressable
            key={mark.roomId}
            role="radio"
            accessibilityLabel={i18n.t('staffAgenda.rooms.legendLabel', {
              letter: mark.letter,
              name: mark.roomName,
            })}
            accessibilityState={{ checked: isSelected }}
            onPress={() => {
              onRoomSelect(isSelected ? null : mark.roomId);
            }}
            style={createChipStyle(theme, isSelected)}
          >
            <RoomMarkDot mark={mark} />
            <View style={CHIP_TEXT_STYLE}>
              <Text variant="caption">{mark.roomName}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
