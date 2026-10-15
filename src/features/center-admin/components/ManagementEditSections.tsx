import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';
import { ListItem } from '@/ui/molecules/ListItem';

import { useRoomList } from '../hooks/useRoomList';
import { useServiceCatalog } from '../hooks/useServiceCatalog';
import { RoomCard } from './RoomCard';
import { SectionHeader } from './SectionHeader';

const SECTION_STYLE = { gap: 12 } as const;

/** Las salas ya creadas: tocar una abre su edición (nombre y aforo). */
export function EditRoomsSection(): React.JSX.Element | null {
  const router = useRouter();
  const rooms = useRoomList().data?.rooms ?? [];

  if (rooms.length === 0) return null;
  return (
    <View style={SECTION_STYLE}>
      <SectionHeader title={i18n.t('centerAdmin.management.editRoomsTitle')} />
      {rooms.map((room, position) => (
        <RoomCard
          key={room.id}
          name={room.name}
          position={position}
          subtitle={i18n.t('centerAdmin.createClass.roomCapacity', { count: room.capacity })}
          accessibilityLabel={i18n.t('centerAdmin.management.editRoomLabel', { name: room.name })}
          onPress={() => {
            router.push({ pathname: '/(admin)/rooms/[roomId]', params: { roomId: room.id } });
          }}
        />
      ))}
    </View>
  );
}

/** Los servicios ya creados: tocar uno abre su edición. */
export function EditServicesSection(): React.JSX.Element | null {
  const router = useRouter();
  const services = useServiceCatalog().data?.services ?? [];

  if (services.length === 0) return null;
  return (
    <View style={SECTION_STYLE}>
      <SectionHeader title={i18n.t('centerAdmin.management.editServicesTitle')} />
      <Text color="ink2">{i18n.t('centerAdmin.management.editServicesHelper')}</Text>
      {services.map((service) => (
        <ListItem
          key={service.id}
          title={service.name}
          subtitle={i18n.t('centerAdmin.createClass.serviceDuration', {
            count: service.durationMinutes,
          })}
          onPress={() => {
            router.push({
              pathname: '/(admin)/services/[serviceId]',
              params: { serviceId: service.id },
            });
          }}
        />
      ))}
    </View>
  );
}
