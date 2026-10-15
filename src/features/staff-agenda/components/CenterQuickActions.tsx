import { useUnreadMessageCount } from '@/features/chat';
import { i18n } from '@/shared/i18n';

import { QuickActionsGrid, type QuickAction } from '@/ui/organisms/QuickActionsGrid';

interface CenterQuickActionsProps {
  /** «Salas y horarios» solo existe en los sectores con salas. */
  canManageSpaces: boolean;
  onAgendaPress: () => void;
  onAssignAppointmentPress: () => void;
  onManagementPress: () => void;
  onServicesPress: () => void;
  onPassesPress: () => void;
  onSetupGuidePress: () => void;
  onMessagesPress: () => void;
}

function buildPrimaryAction(props: CenterQuickActionsProps): QuickAction {
  return {
    id: 'assign',
    iconName: 'plus',
    label: i18n.t('staffAgenda.center.assignAppointmentsAction'),
    hint: i18n.t('staffAgenda.center.assignAppointmentsHint'),
    onPress: props.onAssignAppointmentPress,
  };
}

function buildSetupGuideAction(props: CenterQuickActionsProps): QuickAction {
  return {
    id: 'setupGuide',
    iconName: 'checkCircle',
    label: i18n.t('staffAgenda.center.setupGuideAction'),
    hint: i18n.t('staffAgenda.center.setupGuideHint'),
    onPress: props.onSetupGuidePress,
  };
}

function buildMessagesAction(props: CenterQuickActionsProps, unreadCount: number): QuickAction {
  return {
    id: 'messages',
    iconName: 'messageCircle',
    label: i18n.t('chat.title'),
    hint: i18n.t('staffAgenda.center.messagesHint'),
    badgeCount: unreadCount,
    onPress: props.onMessagesPress,
  };
}

/** «Gestión» solo existe en los sectores con salas. */
function buildManagementActions(props: CenterQuickActionsProps): QuickAction[] {
  if (!props.canManageSpaces) return [];
  return [
    {
      id: 'management',
      iconName: 'settings',
      label: i18n.t('staffAgenda.center.managementAction'),
      hint: i18n.t('staffAgenda.center.managementHint'),
      onPress: props.onManagementPress,
    },
  ];
}

function buildSecondaryActions(
  props: CenterQuickActionsProps,
  unreadMessageCount: number,
): QuickAction[] {
  return [
    {
      id: 'agenda',
      iconName: 'calendar',
      label: i18n.t('staffAgenda.center.agendaAction'),
      hint: i18n.t('staffAgenda.center.agendaHint'),
      onPress: props.onAgendaPress,
    },
    {
      id: 'passes',
      iconName: 'creditCard',
      label: i18n.t('staffAgenda.center.passesAction'),
      hint: i18n.t('staffAgenda.center.passesHint'),
      onPress: props.onPassesPress,
    },
    {
      id: 'services',
      iconName: 'file',
      label: i18n.t('staffAgenda.center.servicesAction'),
      hint: i18n.t('staffAgenda.center.servicesHint'),
      onPress: props.onServicesPress,
    },
    buildMessagesAction(props, unreadMessageCount),
    ...buildManagementActions(props),
    buildSetupGuideAction(props),
  ];
}

/**
 * Los accesos del centro: una acción principal a todo el ancho (asignar citas) y debajo una
 * cuadrícula de tarjetas limpias, cada una con su icono, su nombre y una línea de apoyo.
 */
export function CenterQuickActions(props: Readonly<CenterQuickActionsProps>): React.JSX.Element {
  const unreadMessageCount = useUnreadMessageCount();

  return (
    <QuickActionsGrid
      primaryAction={buildPrimaryAction(props)}
      actions={buildSecondaryActions(props, unreadMessageCount)}
    />
  );
}
