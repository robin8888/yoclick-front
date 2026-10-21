import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';

import { useRepeatableBooking, type RepeatableBooking } from '../hooks/useRepeatableBooking';
import { DEFAULT_CENTER_TIME_ZONE, formatBookingDayAndTime } from '../model/booking-labels';
import { createRepeatCardStyle, REPEAT_TEXT_STYLE } from './RepeatLastBookingCard.styles';

type ConfirmRoute =
  | { pathname: '/(client)/book/confirm'; params: Record<string, string> }
  | { pathname: '/(client)/book/hour-confirm'; params: Record<string, string> };

/** Cuándo y con quién sale lo que se ofrece, sea una clase o una hora libre. */
function describeRepeatable(repeatable: RepeatableBooking): {
  startsAt: string;
  staffName: string;
} {
  return repeatable.kind === 'class'
    ? { startsAt: repeatable.openClass.startsAt, staffName: repeatable.openClass.teacher.fullName }
    : { startsAt: repeatable.slot.startsAt, staffName: repeatable.slot.staffName };
}

/** Una clase se confirma por su id; una hora, por su hora y quien la da. */
function buildConfirmRoute(repeatable: RepeatableBooking): ConfirmRoute {
  const serviceId = repeatable.lastBooking.service.id;
  const { startsAt, staffName } = describeRepeatable(repeatable);
  if (repeatable.kind === 'class') {
    return {
      pathname: '/(client)/book/confirm',
      params: { serviceId, classSessionId: repeatable.openClass.id, startsAt, staffName },
    };
  }
  return {
    pathname: '/(client)/book/hour-confirm',
    params: {
      serviceId,
      startsAt,
      staffMembershipId: repeatable.slot.staffMembershipId,
      staffName,
    },
  };
}

/**
 * Atajo del inicio: «Repetir tu última cita» con el servicio, el día y la hora de la próxima clase u hora
 * libre igual a la anterior. Un toque lleva al resumen de la reserva, saltándose servicio y día. Si no
 * hay una igual, no sale.
 */
export function RepeatLastBookingCard(): React.JSX.Element | null {
  const router = useRouter();
  const theme = useTheme();
  const repeatable = useRepeatableBooking();
  if (repeatable === null) return null;

  const { startsAt, staffName } = describeRepeatable(repeatable);
  const summary = i18n.t('booking.home.repeatSummary', {
    serviceName: repeatable.lastBooking.service.name,
    whenLabel: formatBookingDayAndTime(startsAt, DEFAULT_CENTER_TIME_ZONE),
    staffName,
  });

  return (
    <View style={createRepeatCardStyle(theme)}>
      <View style={REPEAT_TEXT_STYLE}>
        <Text variant="overline" color="ink2">
          {i18n.t('booking.home.repeatTitle')}
        </Text>
        <Text variant="body">{summary}</Text>
      </View>
      <Button
        label={i18n.t('booking.home.repeatAction')}
        variant="outline"
        size="sm"
        leadingIconName="refresh"
        accessibilityLabel={i18n.t('booking.home.repeatAccessibilityLabel', { summary })}
        onPress={() => {
          router.push(buildConfirmRoute(repeatable));
        }}
      />
    </View>
  );
}
