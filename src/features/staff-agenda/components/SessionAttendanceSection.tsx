import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { useTickingNow } from '@/shared/hooks/useTickingNow';
import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';

import { useConfirmAttendance } from '../hooks/useConfirmAttendance';
import { canConfirmAttendance, type SessionAttendee } from '../model/attendance';
import { AttendanceCheckRow } from './AttendanceCheckRow';

const SECTION_STYLE = { gap: 12 } as const;
/** El check se activa solo al llegar la hora; con refrescar cada minuto basta. */
const NOW_REFRESH_MS = 60_000;

interface SessionAttendanceSectionProps {
  attendees: readonly SessionAttendee[];
  startsAt: string;
  /** Administración y personal tienen cada uno su ruta del escáner. */
  isCenterWide: boolean;
}

interface AttendanceListProps {
  attendees: readonly SessionAttendee[];
  isWindowOpen: boolean;
}

/** Una fila con check por persona; confirmar una a la vez, con la carga en toda la lista. */
function AttendanceList({
  attendees,
  isWindowOpen,
}: Readonly<AttendanceListProps>): React.JSX.Element {
  const attendance = useConfirmAttendance();

  return (
    <>
      {attendees.map((attendee) => (
        <AttendanceCheckRow
          key={attendee.bookingId}
          attendee={attendee}
          isDisabled={!isWindowOpen}
          isBusy={attendance.confirmingBookingId !== null}
          onConfirmPress={() => {
            attendance.confirmAttendance(attendee.bookingId);
          }}
        />
      ))}
      {attendance.errorMessage === null ? null : (
        <FormErrorBanner message={attendance.errorMessage} />
      )}
    </>
  );
}

/**
 * «Asistencia» de la clase: cada persona con su foto y un check, y «Confirmar asistencia con QR»,
 * que abre el lector para leer el QR que genera el alumno al entrar. Las dos vías guardan la
 * asistencia y descuentan la clase del bono en vigor.
 */
export function SessionAttendanceSection({
  attendees,
  startsAt,
  isCenterWide,
}: Readonly<SessionAttendanceSectionProps>): React.JSX.Element {
  const router = useRouter();
  const now = useTickingNow(NOW_REFRESH_MS);
  const isWindowOpen = canConfirmAttendance(startsAt, now);

  return (
    <View style={SECTION_STYLE}>
      <Text variant="titleMd" role="heading">
        {i18n.t('staffAgenda.attendance.title')}
      </Text>
      <AttendanceList attendees={attendees} isWindowOpen={isWindowOpen} />
      {isWindowOpen ? null : (
        <Text color="ink2">{i18n.t('staffAgenda.attendance.tooEarlyHint')}</Text>
      )}
      <Button
        isFullWidth
        variant="outline"
        leadingIconName="qrCode"
        label={i18n.t('staffAgenda.attendance.scanAction')}
        onPress={() => {
          router.push(isCenterWide ? '/(admin)/scan' : '/(staff)/scan');
        }}
      />
    </View>
  );
}
