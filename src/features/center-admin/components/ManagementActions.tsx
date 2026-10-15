import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';

import { ManagementActionRow } from './ManagementActionRow';
import { createManagementStackStyle } from './ManagementActionRow.styles';

/**
 * Lo que se crea en «Gestión»: la clase (lo principal: junta sala, servicio, profesor y cuándo) y
 * debajo la sala (nombre y aforo) y el servicio. Cada fila ocupa todo el ancho.
 */
export function ManagementActions(): React.JSX.Element {
  const router = useRouter();
  const theme = useTheme();

  return (
    <View style={createManagementStackStyle(theme)}>
      <ManagementActionRow
        isFeatured
        iconName="calendar"
        label={i18n.t('centerAdmin.management.createClass')}
        hint={i18n.t('centerAdmin.management.createClassHint')}
        onPress={() => {
          router.push('/(admin)/schedules/new');
        }}
      />
      <ManagementActionRow
        iconName="home"
        label={i18n.t('centerAdmin.management.createRoom')}
        hint={i18n.t('centerAdmin.management.createRoomHint')}
        onPress={() => {
          router.push('/(admin)/rooms/new');
        }}
      />
      <ManagementActionRow
        iconName="file"
        label={i18n.t('centerAdmin.management.createService')}
        hint={i18n.t('centerAdmin.management.createServiceHint')}
        onPress={() => {
          router.push({ pathname: '/(admin)/services/[serviceId]', params: { serviceId: 'new' } });
        }}
      />
    </View>
  );
}
