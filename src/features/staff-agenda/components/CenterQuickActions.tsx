import { Pressable, View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { motionTokens, usePressableStyle, useTheme } from '@/shared/theme';
import { Icon, type IconName } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import {
  createQuickActionStyle,
  createQuickActionsRowStyle,
  createQuickActionsStackStyle,
  QUICK_ACTION_WATERMARK_STYLE,
} from './CenterQuickActions.styles';

interface QuickAction {
  id: string;
  iconName: IconName;
  label: string;
  /** La acción que más se usa: va rellena con el color de la marca. */
  isPrimary?: boolean;
  onPress: () => void;
}

function QuickActionTile({
  iconName,
  label,
  isPrimary = false,
  onPress,
}: Readonly<Omit<QuickAction, 'id'>>): React.JSX.Element {
  const theme = useTheme();
  const style = usePressableStyle({
    baseStyle: createQuickActionStyle(theme, isPrimary),
    pressedScale: motionTokens.pressScaleButton,
    isEnabled: true,
  });

  return (
    <Pressable role="button" accessibilityLabel={label} onPress={onPress} style={style}>
      <View style={QUICK_ACTION_WATERMARK_STYLE} pointerEvents="none">
        <Icon name={iconName} size="large" color={isPrimary ? 'onBrand' : 'brandInk'} />
      </View>
      <Text variant="titleMd" numberOfLines={2} color={isPrimary ? 'onBrand' : 'ink'}>
        {label}
      </Text>
    </Pressable>
  );
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

function buildActions(props: CenterQuickActionsProps): QuickAction[] {
  const management: QuickAction[] = props.canManageSpaces
    ? [
        {
          id: 'management',
          iconName: 'settings',
          label: i18n.t('staffAgenda.center.managementAction'),
          onPress: props.onManagementPress,
        },
      ]
    : [];
  return [
    {
      id: 'agenda',
      iconName: 'calendar',
      label: i18n.t('staffAgenda.center.agendaAction'),
      onPress: props.onAgendaPress,
    },
    {
      id: 'assign',
      iconName: 'plus',
      label: i18n.t('staffAgenda.center.assignAppointmentsAction'),
      isPrimary: true,
      onPress: props.onAssignAppointmentPress,
    },
    ...management,
    {
      id: 'services',
      iconName: 'file',
      label: i18n.t('staffAgenda.center.servicesAction'),
      onPress: props.onServicesPress,
    },
    {
      id: 'passes',
      iconName: 'creditCard',
      label: i18n.t('staffAgenda.center.passesAction'),
      onPress: props.onPassesPress,
    },
  ];
}

/**
 * Los accesos del centro como una cuadrícula que llena el ancho: la agenda, asignar citas, salas y
 * horarios, servicios y bonos, cada uno con su icono grande asomando por la esquina.
 */
export function CenterQuickActions(props: Readonly<CenterQuickActionsProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createQuickActionsStackStyle(theme)}>
      {chunkIntoRows(buildActions(props)).map((row) => (
        <View key={row.map(({ id }) => id).join('-')} style={createQuickActionsRowStyle(theme)}>
          {row.map(({ id, ...tile }) => (
            <QuickActionTile key={id} {...tile} />
          ))}
        </View>
      ))}
    </View>
  );
}
