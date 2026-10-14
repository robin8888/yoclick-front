import { View } from 'react-native';

import type { CheckInResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { formatTime24h } from '@/shared/lib/format/format-time';
import { useTheme } from '@/shared/theme';
import { Badge } from '@/ui/atoms/Badge';
import { Text } from '@/ui/atoms/Text';

import type { ScanVerdict } from '../model/scan-verdict';
import { createScanDetailsStyle } from './ScanResultModal.styles';

// Hasta que la API incluya la zona en la reserva (docs/api-requests.md).
const CENTER_TIME_ZONE = 'Europe/Madrid';
const MINUTES_PER_HOUR = 60;

function formatWorkedDuration(workedMinutes: number): string {
  const hours = Math.floor(workedMinutes / MINUTES_PER_HOUR);
  const minutes = workedMinutes % MINUTES_PER_HOUR;
  return i18n.t('timeClock.hoursMinutes', { hours, minutes });
}

/** La entrada o la salida de quien trabaja, con la hora y, al salir, lo trabajado. */
function StaffClockDetails({
  staff,
}: Readonly<{ staff: NonNullable<CheckInResponseDto['staff']> }>): React.JSX.Element {
  const isClockIn = staff.action === 'clock_in';
  const time = formatTime24h(staff.occurredAt, CENTER_TIME_ZONE);

  return (
    <>
      <Badge
        tone="success"
        label={i18n.t(isClockIn ? 'attendance.scan.clockInBadge' : 'attendance.scan.clockOutBadge')}
      />
      <Text color="ink2" align="center">
        {isClockIn
          ? i18n.t('attendance.scan.clockInSummary', { time })
          : i18n.t('attendance.scan.clockOutSummary', {
              time,
              worked: formatWorkedDuration(staff.workedMinutes ?? 0),
            })}
      </Text>
    </>
  );
}

/** La llegada de una persona clienta: asistencia registrada y a qué cita, o por qué no se registra. */
function ClientArrivalDetails({
  checkIn,
}: Readonly<{ checkIn: CheckInResponseDto }>): React.JSX.Element | null {
  const { booking } = checkIn;
  if (booking === undefined) {
    return checkIn.access.isGranted ? (
      <Text color="ink2" align="center">
        {i18n.t('attendance.scan.noAppointmentNow')}
      </Text>
    ) : null;
  }
  const isFirstCheckIn = checkIn.isFirstCheckIn === true;

  return (
    <>
      <Badge
        tone={isFirstCheckIn ? 'success' : 'info'}
        label={i18n.t(
          isFirstCheckIn
            ? 'attendance.scan.registeredBadge'
            : 'attendance.scan.alreadyRegisteredBadge',
        )}
      />
      <Text color="ink2" align="center">
        {i18n.t('attendance.scan.appointmentSummary', {
          serviceName: booking.service.name,
          time: formatTime24h(booking.startsAt, CENTER_TIME_ZONE),
        })}
      </Text>
      {isFirstCheckIn ? null : (
        <Text color="ink2" align="center">
          {i18n.t('attendance.scan.alreadyRegisteredNote')}
        </Text>
      )}
    </>
  );
}

interface ScanResultDetailsProps {
  checkIn: CheckInResponseDto;
  verdict: ScanVerdict;
}

/** Bajo el nombre: el motivo del veredicto y lo que quedó registrado (llegada o fichaje). */
export function ScanResultDetails({
  checkIn,
  verdict,
}: Readonly<ScanResultDetailsProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createScanDetailsStyle(theme)}>
      <Text variant="bodyStrong" align="center">
        {verdict.reasonLine}
      </Text>
      {checkIn.kind === 'staff' && checkIn.staff !== undefined ? (
        <StaffClockDetails staff={checkIn.staff} />
      ) : (
        <ClientArrivalDetails checkIn={checkIn} />
      )}
    </View>
  );
}
