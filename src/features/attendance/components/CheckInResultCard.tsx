import { View } from 'react-native';

import type { CheckInResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { formatTime24h } from '@/shared/lib/format/format-time';
import { useTheme } from '@/shared/theme';
import { Badge } from '@/ui/atoms/Badge';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';

import { createResultCardStyle } from './CheckInResultCard.styles';

// Hasta que la API incluya la zona en la reserva (docs/api-requests.md).
const CENTER_TIME_ZONE = 'Europe/Madrid';

interface CheckInResultCardProps {
  checkIn: CheckInResponseDto;
  onScanAnother: () => void;
}

/** La llegada registrada: quién es, a qué cita y a qué hora; «ya registrada» con palabra. */
export function CheckInResultCard({
  checkIn,
  onScanAnother,
}: Readonly<CheckInResultCardProps>): React.JSX.Element {
  const theme = useTheme();
  const { booking } = checkIn;

  return (
    <View style={createResultCardStyle(theme)}>
      <Badge
        tone={checkIn.isFirstCheckIn ? 'success' : 'info'}
        label={i18n.t(
          checkIn.isFirstCheckIn
            ? 'attendance.scan.registeredBadge'
            : 'attendance.scan.alreadyRegisteredBadge',
        )}
      />
      <Text variant="titleMd">{checkIn.clientFullName}</Text>
      <Text color="ink2">
        {i18n.t('attendance.scan.appointmentSummary', {
          serviceName: booking.service.name,
          time: formatTime24h(booking.startsAt, CENTER_TIME_ZONE),
        })}
      </Text>
      <Button
        variant="secondary"
        label={i18n.t('attendance.scan.scanAnotherAction')}
        onPress={onScanAnother}
      />
    </View>
  );
}
