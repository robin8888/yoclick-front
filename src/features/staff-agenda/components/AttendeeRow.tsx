import { Pressable, View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Avatar } from '@/ui/atoms/Avatar';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import { ATTENDEE_NAME_STYLE, createAttendeeRowStyle } from './AttendeeRow.styles';

interface AttendeeRowProps {
  fullName: string;
  photoUrl: string | null;
  /** Plaza de un grupo fijo (matrícula) y no de una cita suelta. */
  isEnrollment: boolean;
  /** Color de texto literal (blanco sobre el gris de «terminada»); sin él, el normal. */
  tintColor?: string | undefined;
  onPress: () => void;
}

/** Un alumno apuntado a la clase, con su foto; al pulsarlo se abre su perfil. */
export function AttendeeRow({
  fullName,
  photoUrl,
  isEnrollment,
  tintColor,
  onPress,
}: Readonly<AttendeeRowProps>): React.JSX.Element {
  const theme = useTheme();
  const label = isEnrollment
    ? i18n.t('staffAgenda.rooms.enrollmentAttendee', { name: fullName })
    : fullName;

  return (
    <Pressable
      role="button"
      accessibilityLabel={i18n.t('staffAgenda.rooms.openAttendeeProfileLabel', { name: label })}
      onPress={onPress}
      style={createAttendeeRowStyle(theme)}
    >
      <Avatar name={fullName} photoUrl={photoUrl} size="md" isDecorative />
      <View style={ATTENDEE_NAME_STYLE}>
        <Text numberOfLines={1} {...(tintColor === undefined ? {} : { tintColor })}>
          {label}
        </Text>
      </View>
      <Icon name="chevronRight" size="inline" color="ink2" />
    </Pressable>
  );
}
