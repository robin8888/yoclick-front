import { useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { QuickActionsGrid, type QuickAction } from '@/ui/organisms/QuickActionsGrid';

/**
 * Lo que se crea en «Gestión»: una sala (nombre y aforo), un servicio y una clase (que junta sala,
 * servicio, profesor y cuándo). La clase es lo que luego sale en la agenda y donde se apunta gente.
 */
export function ManagementActions(): React.JSX.Element {
  const router = useRouter();
  const actions: QuickAction[] = [
    {
      id: 'room',
      iconName: 'home',
      label: i18n.t('centerAdmin.management.createRoom'),
      hint: i18n.t('centerAdmin.management.createRoomHint'),
      onPress: () => {
        router.push('/(admin)/rooms/new');
      },
    },
    {
      id: 'service',
      iconName: 'file',
      label: i18n.t('centerAdmin.management.createService'),
      hint: i18n.t('centerAdmin.management.createServiceHint'),
      onPress: () => {
        router.push({ pathname: '/(admin)/services/[serviceId]', params: { serviceId: 'new' } });
      },
    },
  ];

  return (
    <QuickActionsGrid
      primaryAction={{
        id: 'class',
        iconName: 'calendar',
        label: i18n.t('centerAdmin.management.createClass'),
        hint: i18n.t('centerAdmin.management.createClassHint'),
        onPress: () => {
          router.push('/(admin)/schedules/new');
        },
      }}
      actions={actions}
    />
  );
}
