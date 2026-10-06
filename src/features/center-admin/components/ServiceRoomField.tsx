import { Controller } from 'react-hook-form';
import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';

import type { useServiceEditorForm } from '../hooks/useServiceEditorForm';
import { useRoomList } from '../hooks/useRoomList';

type ServiceEditorForm = ReturnType<typeof useServiceEditorForm>;

const FIELD_STYLE = { gap: 8 } as const;
const CHIPS_STYLE = { flexDirection: 'row', flexWrap: 'wrap', gap: 8 } as const;

interface ServiceRoomFieldProps {
  form: ServiceEditorForm;
}

/** Prototipo `asvcedit`, «Sala o recurso»: «Sin sala fija» o una de las salas del centro. */
export function ServiceRoomField({ form }: Readonly<ServiceRoomFieldProps>): React.JSX.Element {
  const roomList = useRoomList();
  const rooms = roomList.data?.rooms ?? [];

  return (
    <Controller
      control={form.control}
      name="roomId"
      render={({ field }) => (
        <View style={FIELD_STYLE}>
          <Text variant="bodyStrong">{i18n.t('centerAdmin.serviceEditor.roomLabel')}</Text>
          <View style={CHIPS_STYLE}>
            <Button
              variant={field.value === '' ? 'primary' : 'outline'}
              size="sm"
              label={i18n.t('centerAdmin.serviceEditor.noRoom')}
              onPress={() => {
                field.onChange('');
              }}
            />
            {rooms.map((room) => (
              <Button
                key={room.id}
                variant={field.value === room.id ? 'primary' : 'outline'}
                size="sm"
                label={room.name}
                onPress={() => {
                  field.onChange(room.id);
                }}
              />
            ))}
          </View>
          <Text variant="caption" color="ink2">
            {i18n.t('centerAdmin.serviceEditor.roomHelper')}
          </Text>
        </View>
      )}
    />
  );
}
