import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Chip } from '@/ui/atoms/Chip';

import { WRAP_ROW_STYLE } from './RoomDayGrid.styles';

interface ServiceFilterProps {
  services: readonly { id: string; name: string }[];
  /** El servicio al que se ha filtrado la rejilla; `null` = todos. */
  selectedServiceId: string | null;
  onServiceSelect: (serviceId: string | null) => void;
}

/** «Todos los servicios» y un servicio por ficha: la rejilla enseña solo las clases de ese servicio. */
export function ServiceFilter({
  services,
  selectedServiceId,
  onServiceSelect,
}: Readonly<ServiceFilterProps>): React.JSX.Element | null {
  if (services.length === 0) return null;
  return (
    <View style={WRAP_ROW_STYLE}>
      <Chip
        selectionRole="radio"
        label={i18n.t('staffAgenda.rooms.allServices')}
        isSelected={selectedServiceId === null}
        onPress={() => {
          onServiceSelect(null);
        }}
      />
      {services.map((service) => (
        <Chip
          key={service.id}
          selectionRole="radio"
          label={service.name}
          isSelected={service.id === selectedServiceId}
          onPress={() => {
            onServiceSelect(service.id);
          }}
        />
      ))}
    </View>
  );
}
