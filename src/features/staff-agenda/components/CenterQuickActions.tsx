import { Pressable, View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { motionTokens, usePressableStyle, useTheme } from '@/shared/theme';
import { Icon, type IconName } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import {
  createQuickActionIconStyle,
  createQuickActionStyle,
  createQuickActionsStackStyle,
  createQuickActionsStyle,
} from './CenterQuickActions.styles';

interface QuickActionProps {
  iconName: IconName;
  label: string;
  /** La acción que más se usa: va rellena con el color de la marca. */
  isPrimary?: boolean;
  onPress: () => void;
}

function QuickAction({
  iconName,
  label,
  isPrimary = false,
  onPress,
}: Readonly<QuickActionProps>): React.JSX.Element {
  const theme = useTheme();
  const style = usePressableStyle({
    baseStyle: createQuickActionStyle(theme, isPrimary),
    pressedScale: motionTokens.pressScaleButton,
    isEnabled: true,
  });

  return (
    <Pressable role="button" accessibilityLabel={label} onPress={onPress} style={style}>
      <View style={createQuickActionIconStyle(theme, isPrimary)}>
        <Icon name={iconName} size="navigation" color="brandInk" />
      </View>
      <Text
        variant="bodyStrong"
        align="center"
        numberOfLines={2}
        color={isPrimary ? 'onBrand' : 'ink'}
      >
        {label}
      </Text>
    </Pressable>
  );
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

/** La segunda fila: salas y horarios (si el sector tiene salas), servicios y bonos. */
function ManagementActions({
  canManageSpaces,
  onManagementPress,
  onServicesPress,
  onPassesPress,
}: Readonly<
  Pick<
    CenterQuickActionsProps,
    'canManageSpaces' | 'onManagementPress' | 'onServicesPress' | 'onPassesPress'
  >
>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createQuickActionsStyle(theme)}>
      {canManageSpaces ? (
        <QuickAction
          iconName="settings"
          label={i18n.t('staffAgenda.center.managementAction')}
          onPress={onManagementPress}
        />
      ) : null}
      <QuickAction
        iconName="file"
        label={i18n.t('staffAgenda.center.servicesAction')}
        onPress={onServicesPress}
      />
      <QuickAction
        iconName="creditCard"
        label={i18n.t('staffAgenda.center.passesAction')}
        onPress={onPassesPress}
      />
    </View>
  );
}

/** Los accesos del centro: la agenda, asignar citas, salas y horarios, servicios y bonos. */
export function CenterQuickActions({
  onAgendaPress,
  onAssignAppointmentPress,
  ...managementActions
}: Readonly<CenterQuickActionsProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createQuickActionsStackStyle(theme)}>
      <View style={createQuickActionsStyle(theme)}>
        <QuickAction
          iconName="calendar"
          label={i18n.t('staffAgenda.center.agendaAction')}
          onPress={onAgendaPress}
        />
        <QuickAction
          isPrimary
          iconName="plus"
          label={i18n.t('staffAgenda.center.assignAppointmentsAction')}
          onPress={onAssignAppointmentPress}
        />
      </View>
      <ManagementActions {...managementActions} />
    </View>
  );
}
