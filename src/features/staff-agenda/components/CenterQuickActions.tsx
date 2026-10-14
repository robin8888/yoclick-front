import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import type { IconName } from '@/ui/atoms/Icon';

import { PrimaryQuickAction, QuickActionTile } from './CenterQuickActionTile';
import {
  createQuickActionsRowStyle,
  createQuickActionsStackStyle,
} from './CenterQuickActions.styles';

interface QuickAction {
  id: string;
  iconName: IconName;
  label: string;
  hint: string;
  onPress: () => void;
}

const TILES_PER_ROW = 2;

/** De dos en dos; si sobra uno, ocupa toda la fila: nunca queda un hueco ni un botón estrecho. */
function chunkIntoRows(actions: readonly QuickAction[]): QuickAction[][] {
  const rows: QuickAction[][] = [];
  for (let index = 0; index < actions.length; index += TILES_PER_ROW) {
    rows.push(actions.slice(index, index + TILES_PER_ROW));
  }
  return rows;
}

interface CenterQuickActionsProps {
  /** «Salas y horarios» solo existe en los sectores con salas. */
  canManageSpaces: boolean;
  onAgendaPress: () => void;
  onAssignAppointmentPress: () => void;
  onManagementPress: () => void;
  onServicesPress: () => void;
  onPassesPress: () => void;
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

function buildSecondaryActions(props: CenterQuickActionsProps): QuickAction[] {
  const management: QuickAction[] = props.canManageSpaces
    ? [
        {
          id: 'management',
          iconName: 'settings',
          label: i18n.t('staffAgenda.center.managementAction'),
          hint: i18n.t('staffAgenda.center.managementHint'),
          onPress: props.onManagementPress,
        },
      ]
    : [];
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
    ...management,
  ];
}

/**
 * Los accesos del centro: una acción principal a todo el ancho (asignar citas) y debajo una
 * cuadrícula de tarjetas limpias, cada una con su icono, su nombre y una línea de apoyo.
 */
export function CenterQuickActions(props: Readonly<CenterQuickActionsProps>): React.JSX.Element {
  const theme = useTheme();
  const { id: primaryId, ...primaryAction } = buildPrimaryAction(props);

  return (
    <View style={createQuickActionsStackStyle(theme)}>
      <PrimaryQuickAction key={primaryId} {...primaryAction} />
      {chunkIntoRows(buildSecondaryActions(props)).map((row) => (
        <View key={row.map(({ id }) => id).join('-')} style={createQuickActionsRowStyle(theme)}>
          {row.map(({ id, ...tile }) => (
            <QuickActionTile key={id} {...tile} />
          ))}
        </View>
      ))}
    </View>
  );
}
