import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';

import { useRepeatableClass, type RepeatableClass } from '../hooks/useRepeatableClass';
import { DEFAULT_CENTER_TIME_ZONE, formatBookingDayAndTime } from '../model/booking-labels';
import { createRepeatCardStyle, REPEAT_TEXT_STYLE } from './RepeatLastBookingCard.styles';

function buildConfirmParams({ lastBooking, openClass }: RepeatableClass): Record<string, string> {
  return {
    serviceId: lastBooking.service.id,
    classSessionId: openClass.id,
    startsAt: openClass.startsAt,
    staffName: openClass.teacher.fullName,
  };
}

/**
 * Atajo del inicio: «Repetir tu última cita» con el servicio, el día y la hora de la próxima clase igual
 * a la anterior. Un toque lleva al resumen de la reserva, saltándose servicio y día. Si no hay una clase
 * igual con plazas, no sale.
 */
export function RepeatLastBookingCard(): React.JSX.Element | null {
  const router = useRouter();
  const theme = useTheme();
  const repeatable = useRepeatableClass();
  if (repeatable === null) return null;

  const { lastBooking, openClass } = repeatable;
  const whenLabel = formatBookingDayAndTime(openClass.startsAt, DEFAULT_CENTER_TIME_ZONE);
  const summary = i18n.t('booking.home.repeatSummary', {
    serviceName: lastBooking.service.name,
    whenLabel,
    staffName: openClass.teacher.fullName,
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
          router.push({
            pathname: '/(client)/book/confirm',
            params: buildConfirmParams(repeatable),
          });
        }}
      />
    </View>
  );
}
