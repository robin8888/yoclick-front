import { useRouter } from 'expo-router';
import { View } from 'react-native';

import type { RoomListResponseDtoRoomsItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { ListItem } from '@/ui/molecules/ListItem';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { useRoomList } from '../hooks/useRoomList';

const LIST_STYLE = { gap: 12 } as const;

function describeRoom(room: RoomListResponseDtoRoomsItem): string {
  const teacherLabel =
    room.staff === null
      ? i18n.t('centerAdmin.management.roomSubtitleAnyone', { capacity: room.capacity })
      : i18n.t('centerAdmin.management.roomSubtitle', {
          capacity: room.capacity,
          teacher: room.staff.fullName,
        });
  if (room.services.length === 0) return teacherLabel;
  return `${teacherLabel} · ${room.services.map(({ name }) => name).join(', ')}`;
}

function RoomItems({
  rooms,
}: Readonly<{ rooms: readonly RoomListResponseDtoRoomsItem[] }>): React.JSX.Element {
  const router = useRouter();

  return (
    <View style={LIST_STYLE}>
      {rooms.map((room) => (
        <ListItem
          key={room.id}
          title={room.name}
          subtitle={describeRoom(room)}
          leadingIconName="home"
          accessibilityLabel={i18n.t('centerAdmin.management.roomLabel', {
            name: room.name,
            capacity: room.capacity,
          })}
          onPress={() => {
            router.push({ pathname: '/(admin)/rooms/[roomId]', params: { roomId: room.id } });
          }}
        />
      ))}
    </View>
  );
}

/**
 * «Gestión» de las academias: las salas donde se dan las clases, con su aforo y el profesor que da
 * clase en cada una. Con ellas el centro asigna citas privadas o grupales.
 */
export function ManagementScreen(): React.JSX.Element {
  const router = useRouter();
  const roomList = useRoomList();
  const rooms = roomList.data?.rooms ?? [];

  return (
    <ScreenTemplate
      title={i18n.t('centerAdmin.management.title')}
      subtitle={i18n.t('centerAdmin.management.subtitle')}
    >
      <Button
        label={i18n.t('centerAdmin.management.addAction')}
        isFullWidth
        onPress={() => {
          router.push('/(admin)/rooms/new');
        }}
      />
      {roomList.isError ? (
        <Text color="danger" role="alert">
          {i18n.t('centerAdmin.management.loadError')}
        </Text>
      ) : null}
      {roomList.isSuccess && rooms.length === 0 ? (
        <View style={LIST_STYLE}>
          <Text variant="titleMd">{i18n.t('centerAdmin.management.emptyTitle')}</Text>
          <Text color="ink2">{i18n.t('centerAdmin.management.emptyMessage')}</Text>
        </View>
      ) : null}
      <RoomItems rooms={rooms} />
    </ScreenTemplate>
  );
}
