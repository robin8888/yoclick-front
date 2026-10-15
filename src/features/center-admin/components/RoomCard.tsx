import { Pressable, View } from 'react-native';

import { pickRoomPaletteColor, useTheme } from '@/shared/theme';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import {
  createRoomCardStyle,
  createRoomCheckStyle,
  createRoomLetterStyle,
  ROOM_CARD_BODY_STYLE,
} from './RoomCard.styles';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

interface RoomCardProps {
  name: string;
  /** Posición del espacio en la lista: da la letra y el color que tiene en la agenda del centro. */
  position: number;
  /** «Aforo 12 · Da clase Ana Ruiz · Solo Salsa». */
  subtitle: string;
  accessibilityLabel: string;
  /** Si se usa para elegir una sala: marca la elegida con un check en vez de la flecha. */
  isSelected?: boolean | undefined;
  onPress: () => void;
}

function RoomCardTrailingIcon({
  isSelected,
}: Readonly<{ isSelected: boolean }>): React.JSX.Element {
  const theme = useTheme();
  if (!isSelected) return <Icon name="chevronRight" size="inline" color="ink2" />;
  return (
    <View style={createRoomCheckStyle(theme)}>
      <Icon name="check" size="inline" color="onBrand" />
    </View>
  );
}

/** Un espacio del centro: su letra y color de la agenda, el nombre y lo que lo define. */
export function RoomCard({
  name,
  position,
  subtitle,
  accessibilityLabel,
  isSelected,
  onPress,
}: Readonly<RoomCardProps>): React.JSX.Element {
  const theme = useTheme();
  const color = pickRoomPaletteColor(position);

  return (
    <Pressable
      role="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={isSelected === undefined ? undefined : { selected: isSelected }}
      onPress={onPress}
      style={createRoomCardStyle(theme, color.background, isSelected === true)}
    >
      <View style={createRoomLetterStyle(color.background)} accessibilityElementsHidden>
        <Text variant="bodyStrong" tintColor={color.text}>
          {LETTERS[position] ?? String(position + 1)}
        </Text>
      </View>
      <View style={ROOM_CARD_BODY_STYLE}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {name}
        </Text>
        <Text variant="caption" color="ink2">
          {subtitle}
        </Text>
      </View>
      <RoomCardTrailingIcon isSelected={isSelected === true} />
    </Pressable>
  );
}
