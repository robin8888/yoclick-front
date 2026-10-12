import { Controller, type Control } from 'react-hook-form';
import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';

import { useServiceCatalog } from '../hooks/useServiceCatalog';
import { ANY_SERVICE_VALUE, type RoomFormValues } from '../model/room-form';

const FIELD_STYLE = { gap: 8 } as const;
const CHIPS_STYLE = { flexDirection: 'row', flexWrap: 'wrap', gap: 8 } as const;

interface RoomFixedServiceFieldProps {
  control: Control<RoomFormValues>;
}

/** El único servicio que se da en el espacio («Solo Inglés B1») o «Cualquier servicio». */
export function RoomFixedServiceField({
  control,
}: Readonly<RoomFixedServiceFieldProps>): React.JSX.Element {
  const services = useServiceCatalog().data?.services ?? [];

  return (
    <Controller
      control={control}
      name="fixedServiceId"
      render={({ field }) => (
        <View style={FIELD_STYLE}>
          <Text variant="bodyStrong">{i18n.t('centerAdmin.rooms.fixedServiceLabel')}</Text>
          <View style={CHIPS_STYLE}>
            <Button
              size="sm"
              variant={field.value === ANY_SERVICE_VALUE ? 'primary' : 'outline'}
              label={i18n.t('centerAdmin.rooms.noFixedService')}
              onPress={() => {
                field.onChange(ANY_SERVICE_VALUE);
              }}
            />
            {services.map((service) => (
              <Button
                key={service.id}
                size="sm"
                variant={field.value === service.id ? 'primary' : 'outline'}
                label={service.name}
                onPress={() => {
                  field.onChange(service.id);
                }}
              />
            ))}
          </View>
          <Text variant="caption" color="ink2">
            {i18n.t('centerAdmin.rooms.fixedServiceHelper')}
          </Text>
        </View>
      )}
    />
  );
}
