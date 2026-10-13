import { View } from 'react-native';

import { FINISHED_PALETTE, useTheme } from '@/shared/theme';
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

/** Líneas secundarias opcionales (sala, quién la asignó); las que no hay no se pintan. */
function AppointmentCaptions({
  labels,
  tint,
}: Readonly<{
  labels: readonly (string | null | undefined)[];
  tint: { tintColor?: string };
}>): React.JSX.Element {
  return (
    <>
      {labels.map((label) =>
        label === null || label === undefined ? null : (
          <Text key={label} variant="caption" color="ink2" {...tint}>
            {label}
          </Text>
        ),
      )}
    </>
  );
}

type AppointmentDetailsProps = Pick<
  AppointmentCardProps,
  'serviceName' | 'detailsLabel' | 'roomLabel' | 'assignedByLabel' | 'statusLabel' | 'statusTone'
> & { tint: { tintColor?: string } };

function AppointmentDetails({
  serviceName,
  detailsLabel,
  roomLabel,
  assignedByLabel,
  statusLabel,
  statusTone,
  tint,
}: Readonly<AppointmentDetailsProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createAppointmentDetailsStyle(theme)}>
      <Text variant="bodyStrong" {...tint}>
        {serviceName}
      </Text>
      <Text variant="caption" color="ink2" {...tint}>
        {detailsLabel}
      </Text>
      <AppointmentCaptions labels={[roomLabel, assignedByLabel]} tint={tint} />
      <View style={createStatusBadgeRowStyle(theme)}>
        <Badge label={statusLabel} tone={statusTone} />
      </View>
    </View>
  );
}

/**
 * Una cita como en el prototipo `appts`: bloque de fecha, servicio, detalle, estado (siempre con
 * palabra) y sus acciones. Recibe datos y callbacks por props; no sabe nada de la API.
 */
export function AppointmentCard({
  dateTile,
  buttonActions,
  linkActions,
  isPast = false,
  ...details
}: Readonly<AppointmentCardProps>): React.JSX.Element {
  const theme = useTheme();
  const tint = isPast ? { tintColor: FINISHED_PALETTE.text } : {};

  return (
    <View style={createAppointmentCardStyle(theme, isPast)}>
      <View style={APPOINTMENT_SUMMARY_STYLE}>
        <AppointmentDateBlock dateTile={dateTile} />
        <AppointmentDetails {...details} tint={tint} />
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
