import { useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { QuickActionsGrid, type QuickAction } from '@/ui/organisms/QuickActionsGrid';

type Route = Parameters<ReturnType<typeof useRouter>['push']>[0];

function buildSecondaryActions(open: (route: Route) => () => void): QuickAction[] {
  return [
    {
      id: 'bookings',
      iconName: 'calendar',
      label: i18n.t('booking.home.myBookingsAction'),
      hint: i18n.t('booking.home.myBookingsHint'),
      onPress: open('/(client)/(tabs)/bookings'),
    },
    {
      id: 'passes',
      iconName: 'creditCard',
      label: i18n.t('booking.home.passesAction'),
      hint: i18n.t('booking.home.passesHint'),
      onPress: open('/(client)/my-passes'),
    },
    {
      id: 'team',
      iconName: 'users',
      label: i18n.t('booking.home.teamAction'),
      hint: i18n.t('booking.home.teamHint'),
      onPress: open('/(client)/team'),
    },
    {
      id: 'messages',
      iconName: 'messageCircle',
      label: i18n.t('chat.title'),
      hint: i18n.t('booking.home.messagesHint'),
      onPress: open('/(client)/messages'),
    },
  ];
}

/**
 * Los accesos del inicio del alumno, con el mismo aspecto que los del centro: reservar arriba, a
 * ancho completo, y debajo sus citas, sus bonos, el equipo y los mensajes.
 */
export function ClientQuickActions(): React.JSX.Element {
  const router = useRouter();
  const open = (route: Route) => () => {
    router.push(route);
  };

  return (
    <QuickActionsGrid
      primaryAction={{
        id: 'book',
        iconName: 'plus',
        label: i18n.t('booking.home.bookAction'),
        hint: i18n.t('booking.home.bookHint'),
        onPress: open('/(client)/(tabs)/book'),
      }}
      actions={buildSecondaryActions(open)}
    />
  );
}
