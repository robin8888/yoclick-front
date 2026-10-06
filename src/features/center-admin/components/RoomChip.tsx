import { Pressable } from 'react-native';

import type { RoomListResponseDtoRoomsItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import { createRoomChipStyle } from './RoomChip.styles';

interface RoomChipProps {
  room: RoomListResponseDtoRoomsItem;
  onRemovePress: () => void;
}

/** Una sala del centro con su aforo; la cruz la quita (con confirmación). */
export function RoomChip({ room, onRemovePress }: Readonly<RoomChipProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <Pressable
      role="button"
      accessibilityLabel={i18n.t('centerAdmin.rooms.removeChipLabel', {
        name: room.name,
        capacity: room.capacity,
      })}
      onPress={onRemovePress}
      style={createRoomChipStyle(theme)}
    >
      <Text variant="bodyStrong">{room.name}</Text>
      <Text variant="caption" color="ink2">
        {i18n.t('centerAdmin.rooms.capacityShort', { capacity: room.capacity })}
      </Text>
      <Icon name="close" size="inline" color="ink2" />
    </Pressable>
  );
}
