import { View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { Badge } from '@/ui/atoms/Badge';
import { Text } from '@/ui/atoms/Text';

import { AppointmentButtonRow, AppointmentLinkRow } from './AppointmentActions';
import {
  APPOINTMENT_SUMMARY_STYLE,
  createAppointmentCardStyle,
  createAppointmentDetailsStyle,
  createDateTileStyle,
  createStatusBadgeRowStyle,
} from './AppointmentCard.styles';
import type { AppointmentCardProps } from './AppointmentCard.types';

function AppointmentDateBlock({
  dateTile,
}: Readonly<Pick<AppointmentCardProps, 'dateTile'>>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View accessible aria-label={dateTile.accessibleLabel} style={createDateTileStyle(theme)}>
      <Text variant="overline" color="brandInk">
        {dateTile.weekdayLabel}
      </Text>
      <Text variant="titleLg" color="brandInk">
        {dateTile.dayLabel}
      </Text>
      <Text variant="overline" color="brandInk">
        {dateTile.monthLabel}
      </Text>
    </View>
  );
}

/**
 * Una cita como en el prototipo `appts`: bloque de fecha, servicio, detalle, estado (siempre con
 * palabra) y sus acciones. Recibe datos y callbacks por props; no sabe nada de la API.
 */
export function AppointmentCard({
  dateTile,
  serviceName,
  detailsLabel,
  statusLabel,
  statusTone,
  buttonActions,
  linkActions,
}: Readonly<AppointmentCardProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createAppointmentCardStyle(theme)}>
      <View style={APPOINTMENT_SUMMARY_STYLE}>
        <AppointmentDateBlock dateTile={dateTile} />
        <View style={createAppointmentDetailsStyle(theme)}>
          <Text variant="bodyStrong">{serviceName}</Text>
          <Text variant="caption" color="ink2">
            {detailsLabel}
          </Text>
          <View style={createStatusBadgeRowStyle(theme)}>
            <Badge label={statusLabel} tone={statusTone} />
          </View>
        </View>
      </View>
      {buttonActions === undefined || buttonActions.length === 0 ? null : (
        <AppointmentButtonRow actions={buttonActions} />
      )}
      {linkActions === undefined || linkActions.length === 0 ? null : (
        <AppointmentLinkRow actions={linkActions} />
      )}
    </View>
  );
}
