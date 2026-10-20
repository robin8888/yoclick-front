import { useRouter } from 'expo-router';

import { useUnreadMessageCount } from '@/features/chat';
import { useMyChildren } from '@/features/guardians';
import { useActiveCenterModules } from '@/features/join';
import { i18n } from '@/shared/i18n';
import { QuickActionsGrid, type QuickAction } from '@/ui/organisms/QuickActionsGrid';

type Route = Parameters<ReturnType<typeof useRouter>['push']>[0];

/** «Mis hijos» solo sale a quien es tutor de alguien. */
function buildChildrenAction(
  open: (route: Route) => () => void,
  hasChildren: boolean,
): QuickAction[] {
  if (!hasChildren) return [];
  return [
    {
      id: 'children',
      iconName: 'users',
      label: i18n.t('guardians.title'),
      hint: i18n.t('guardians.homeHint'),
      onPress: open('/(client)/children'),
    },
  ];
}

function buildMessagesAction(
  open: (route: Route) => () => void,
  unreadMessageCount: number,
): QuickAction {
  return {
    id: 'messages',
    iconName: 'messageCircle',
    label: i18n.t('chat.title'),
    hint: i18n.t('booking.home.messagesHint'),
    badgeCount: unreadMessageCount,
    onPress: open('/(client)/messages'),
  };
}

function buildPassesAction(open: (route: Route) => () => void, hasPasses: boolean): QuickAction[] {
  if (!hasPasses) return [];
  return [
    {
      id: 'passes',
      iconName: 'creditCard',
      label: i18n.t('booking.home.passesAction'),
      hint: i18n.t('booking.home.passesHint'),
      onPress: open('/(client)/my-passes'),
    },
  ];
}

function buildSecondaryActions(
  open: (route: Route) => () => void,
  options: { hasChildren: boolean; hasPasses: boolean; unreadMessageCount: number },
): QuickAction[] {
  return [
    ...buildChildrenAction(open, options.hasChildren),
    {
      id: 'bookings',
      iconName: 'calendar',
      label: i18n.t('booking.home.myBookingsAction'),
      hint: i18n.t('booking.home.myBookingsHint'),
      onPress: open('/(client)/(tabs)/bookings'),
    },
    ...buildPassesAction(open, options.hasPasses),
    {
      id: 'team',
      iconName: 'users',
      label: i18n.t('booking.home.teamAction'),
      hint: i18n.t('booking.home.teamHint'),
      onPress: open('/(client)/team'),
    },
    buildMessagesAction(open, options.unreadMessageCount),
  ];
}

/**
 * Los accesos del inicio del alumno, con el mismo aspecto que los del centro: reservar arriba, a
 * ancho completo, y debajo sus citas, sus bonos, el equipo y los mensajes.
 */
export function ClientQuickActions(): React.JSX.Element {
  const router = useRouter();
  const hasChildren = (useMyChildren().data?.children.length ?? 0) > 0;
  const unreadMessageCount = useUnreadMessageCount();
  const hasPasses = useActiveCenterModules().passes;
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
      actions={buildSecondaryActions(open, { hasChildren, hasPasses, unreadMessageCount })}
    />
  );
}
