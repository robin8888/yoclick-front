import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';

import { useRoomList } from '../hooks/useRoomList';
import { RoomCard } from './RoomCard';
import { SectionHeader } from './SectionHeader';

const SECTION_STYLE = { gap: 12 } as const;

/**
 * «Alquiler y mantenimiento»: desde aquí se aparta una sala (alquiler, mantenimiento, un evento)
 * en unas horas para que no se pueda usar ni asignar citas. Se elige la sala y se abre su lista de
 * bloqueos, donde se crean y se quitan.
 */
export function RoomBlocksManagementSection(): React.JSX.Element | null {
  const router = useRouter();
  const roomList = useRoomList();
  const rooms = roomList.data?.rooms ?? [];

  if (rooms.length === 0) return null;
  return (
    <View style={SECTION_STYLE}>
      <SectionHeader title={i18n.t('centerAdmin.management.blocksTitle')} />
      <Text color="ink2">{i18n.t('centerAdmin.management.blocksHelper')}</Text>
      {rooms.map((room, position) => (
        <RoomCard
          key={room.id}
          name={room.name}
          position={position}
          subtitle={i18n.t('centerAdmin.management.blocksRoomSubtitle')}
          accessibilityLabel={i18n.t('centerAdmin.management.blocksRoomLabel', { name: room.name })}
          onPress={() => {
            router.push({ pathname: '/(admin)/room-blocks/[roomId]', params: { roomId: room.id } });
          }}
        />
      ))}
    </View>
  );
}
