import { useRouter } from 'expo-router';
import { View } from 'react-native';

import type { RoomListResponseDtoRoomsItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';

import { useRoomList } from '../hooks/useRoomList';
import { RoomCard } from './RoomCard';
import { SectionHeader } from './SectionHeader';

const SECTION_STYLE = { gap: 12 } as const;

/** «Aforo 12 · Da clase Ana Ruiz · Solo Inglés B1» o la lista de servicios que se dan allí. */
function describeRoom(room: RoomListResponseDtoRoomsItem): string {
  const teacherLabel =
    room.staff === null
      ? i18n.t('centerAdmin.management.roomSubtitleAnyone', { capacity: room.capacity })
      : i18n.t('centerAdmin.management.roomSubtitle', {
          capacity: room.capacity,
          teacher: room.staff.fullName,
        });
  if (room.fixedService !== null) {
    const fixedServiceLabel = i18n.t('centerAdmin.management.roomFixedService', {
      service: room.fixedService.name,
    });
    return `${teacherLabel} · ${fixedServiceLabel}`;
  }
  if (room.services.length === 0) return teacherLabel;
  return `${teacherLabel} · ${room.services.map(({ name }) => name).join(', ')}`;
}

function RoomItems({
  rooms,
}: Readonly<{ rooms: readonly RoomListResponseDtoRoomsItem[] }>): React.JSX.Element {
  const router = useRouter();

  return (
    <>
      {rooms.map((room, position) => (
        <RoomCard
          key={room.id}
          name={room.name}
          position={position}
          subtitle={describeRoom(room)}
          accessibilityLabel={i18n.t('centerAdmin.management.roomLabel', {
            name: room.name,
            capacity: room.capacity,
          })}
          onPress={() => {
            router.push({ pathname: '/(admin)/rooms/[roomId]', params: { roomId: room.id } });
          }}
        />
      ))}
    </>
  );
}

/** «Espacios»: salas, aulas o pistas con su aforo, su profesor y su servicio fijos; «Nuevo espacio». */
export function RoomsManagementSection(): React.JSX.Element {
  const router = useRouter();
  const roomList = useRoomList();
  const rooms = roomList.data?.rooms ?? [];

  return (
    <View style={SECTION_STYLE}>
      <SectionHeader
        title={i18n.t('centerAdmin.management.roomsTitle')}
        actionLabel={i18n.t('centerAdmin.management.addAction')}
        onActionPress={() => {
          router.push('/(admin)/rooms/new');
        }}
      />
      {roomList.isError ? (
        <Text color="danger" role="alert">
          {i18n.t('centerAdmin.management.loadError')}
        </Text>
      ) : null}
      {roomList.isSuccess && rooms.length === 0 ? (
        <>
          <Text variant="titleMd">{i18n.t('centerAdmin.management.emptyTitle')}</Text>
          <Text color="ink2">{i18n.t('centerAdmin.management.emptyMessage')}</Text>
        </>
      ) : null}
      <RoomItems rooms={rooms} />
    </View>
  );
}
