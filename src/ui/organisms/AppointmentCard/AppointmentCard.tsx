import { View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { Badge } from '@/ui/atoms/Badge';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';

import { createAppointmentCardStyle, APPOINTMENT_HEADER_STYLE } from './AppointmentCard.styles';
import type { AppointmentCardProps } from './AppointmentCard.types';

/**
 * Una cita: servicio, cuándo, con quién y su estado (siempre con palabra). Recibe los datos y la
 * acción por props; no sabe nada de la API.
 */
export function AppointmentCard({
  serviceName,
  whenLabel,
  staffLabel,
  statusLabel,
  statusTone,
  actionLabel,
  onActionPress,
}: Readonly<AppointmentCardProps>): React.JSX.Element {
  const theme = useTheme();
  const hasAction = actionLabel !== undefined && onActionPress !== undefined;

  return (
    <View style={createAppointmentCardStyle(theme)}>
      <View style={APPOINTMENT_HEADER_STYLE}>
        <Text variant="titleMd">{serviceName}</Text>
        <Badge label={statusLabel} tone={statusTone} />
      </View>
      <Text variant="bodyStrong" color="brandInk">
        {whenLabel}
      </Text>
      <Text variant="caption" color="ink2">
        {staffLabel}
      </Text>
      {hasAction ? (
        <Button variant="outline" size="sm" label={actionLabel} onPress={onActionPress} />
      ) : null}
    </View>
  );
}
