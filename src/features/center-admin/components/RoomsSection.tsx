import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import type { RoomListResponseDtoRoomsItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';

import { useRoomList } from '../hooks/useRoomList';
import { RemoveRoomSheet } from './RemoveRoomSheet';
import { RoomChip } from './RoomChip';
import { ROOM_CHIPS_STYLE } from './RoomChip.styles';
import { SectionHeader } from './SectionHeader';

const SECTION_STYLE = { gap: 12 } as const;

/** Prototipo `asvc`, «Salas y recursos»: las salas como etiquetas, con «Añadir» y una cruz para quitarlas. */
export function RoomsSection(): React.JSX.Element {
  const router = useRouter();
  const roomList = useRoomList();
  const [roomToRemove, setRoomToRemove] = useState<RoomListResponseDtoRoomsItem | null>(null);
  const rooms = roomList.data?.rooms ?? [];

  return (
    <View style={SECTION_STYLE}>
      <SectionHeader
        title={i18n.t('centerAdmin.rooms.title')}
        actionLabel={i18n.t('centerAdmin.rooms.addAction')}
        onActionPress={() => {
          router.push('/(admin)/rooms/new');
        }}
      />
      {roomList.isError ? (
        <Text color="danger">{i18n.t('centerAdmin.rooms.loadError')}</Text>
      ) : null}
      {roomList.isSuccess && rooms.length === 0 ? (
        <Text color="ink2">{i18n.t('centerAdmin.rooms.empty')}</Text>
      ) : null}
      <View style={ROOM_CHIPS_STYLE}>
        {rooms.map((room) => (
          <RoomChip
            key={room.id}
            room={room}
            onRemovePress={() => {
              setRoomToRemove(room);
            }}
          />
        ))}
      </View>
      <RemoveRoomSheet
        room={roomToRemove}
        onClose={() => {
          setRoomToRemove(null);
        }}
      />
    </View>
  );
}
