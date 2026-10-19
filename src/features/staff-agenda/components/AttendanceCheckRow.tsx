import { Pressable, View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Avatar } from '@/ui/atoms/Avatar';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import type { SessionAttendee } from '../model/attendance';
import {
  ATTENDANCE_NAME_STYLE,
  createAttendanceRowStyle,
  createCheckStyle,
} from './AttendanceCheckRow.styles';

interface AttendanceCheckRowProps {
  attendee: SessionAttendee;
  /** Aún no es la hora de confirmar (más de una hora antes) o se está confirmando otra. */
  isDisabled: boolean;
  isBusy: boolean;
  onConfirmPress: () => void;
}

function resolveStatusText(attendee: SessionAttendee): string {
  if (attendee.isConfirmed) return i18n.t('staffAgenda.attendance.confirmedText');
  return attendee.needsNewPass
    ? i18n.t('staffAgenda.attendance.needsNewPassText')
    : i18n.t('staffAgenda.attendance.pendingText');
}

function resolveStatusColor(attendee: SessionAttendee): 'success' | 'warning' | 'ink2' {
  if (attendee.isConfirmed) return 'success';
  return attendee.needsNewPass ? 'warning' : 'ink2';
}

/**
 * Una persona de la clase: su foto, su nombre y el check de asistencia. Confirmada, el check queda
 * relleno y no se puede deshacer (el bono ya se descontó); nunca depende solo del color.
 */
export function AttendanceCheckRow({
  attendee,
  isDisabled,
  isBusy,
  onConfirmPress,
}: Readonly<AttendanceCheckRowProps>): React.JSX.Element {
  const theme = useTheme();
  const { fullName, photoUrl, isConfirmed } = attendee;
  const label = isConfirmed
    ? i18n.t('staffAgenda.attendance.confirmedLabel', { name: fullName })
    : i18n.t('staffAgenda.attendance.confirmLabel', { name: fullName });
  const isInteractive = !isConfirmed && !attendee.needsNewPass && !isDisabled && !isBusy;

  return (
    <View style={createAttendanceRowStyle(theme)}>
      <Avatar name={fullName} photoUrl={photoUrl} size="md" isDecorative />
      <View style={ATTENDANCE_NAME_STYLE}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {fullName}
        </Text>
        <Text variant="caption" color={resolveStatusColor(attendee)}>
          {resolveStatusText(attendee)}
        </Text>
      </View>
      <Pressable
        role="checkbox"
        accessibilityLabel={label}
        accessibilityState={{ checked: isConfirmed, disabled: !isInteractive, busy: isBusy }}
        disabled={!isInteractive}
        hitSlop={theme.space[2]}
        onPress={onConfirmPress}
        style={createCheckStyle(theme, isConfirmed)}
      >
        {isConfirmed ? <Icon name="check" color="surface" /> : null}
      </Pressable>
    </View>
  );
}
