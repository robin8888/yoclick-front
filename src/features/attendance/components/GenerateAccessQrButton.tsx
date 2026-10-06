import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { formatTime24h } from '@/shared/lib/format/format-time';
import { useTheme } from '@/shared/theme';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import { useCheckInQrAvailability } from '../hooks/useCheckInQrAvailability';
import {
  CHECK_IN_QR_LEAD_TIME_MINUTES,
  type CheckInQrAvailability,
} from '../model/check-in-qr-availability';
import {
  createGenerateQrCardStyle,
  createGenerateQrIconTileStyle,
  GENERATE_QR_TEXT_STYLE,
} from './GenerateAccessQrButton.styles';

interface GenerateAccessQrButtonProps {
  nextAppointment: { startsAt: string; endsAt: string } | undefined;
  timeZone: string;
}

function buildStatusHint(
  availability: CheckInQrAvailability | undefined,
  timeZone: string,
): string {
  if (availability === undefined) {
    return i18n.t('attendance.generateQr.noAppointmentHint', {
      minutes: CHECK_IN_QR_LEAD_TIME_MINUTES,
    });
  }
  if (availability.isAvailable) return i18n.t('attendance.generateQr.readyHint');
  return i18n.t('attendance.generateQr.opensAtHint', {
    time: formatTime24h(availability.opensAtIso, timeZone),
    minutes: CHECK_IN_QR_LEAD_TIME_MINUTES,
  });
}

/**
 * Siempre visible para que la persona sepa que existe, pero solo se activa poco antes de la cita:
 * el QR caduca a los 5 minutos y no tiene sentido generarlo con horas de adelanto. El estado se
 * distingue por icono y por texto, no solo por color.
 */
export function GenerateAccessQrButton({
  nextAppointment,
  timeZone,
}: Readonly<GenerateAccessQrButtonProps>): React.JSX.Element {
  const router = useRouter();
  const theme = useTheme();
  const availability = useCheckInQrAvailability(nextAppointment);
  const isAvailable = availability?.isAvailable === true;
  const contentColor = isAvailable ? 'onBrand' : 'ink';

  return (
    <Pressable
      role="button"
      accessibilityLabel={i18n.t('attendance.generateQr.action')}
      accessibilityHint={buildStatusHint(availability, timeZone)}
      accessibilityState={{ disabled: !isAvailable }}
      disabled={!isAvailable}
      onPress={() => {
        router.push('/(client)/access-qr');
      }}
      style={createGenerateQrCardStyle(theme, isAvailable)}
    >
      <View style={createGenerateQrIconTileStyle(theme, isAvailable)}>
        <Icon
          name={isAvailable ? 'qrCode' : 'lock'}
          size="navigation"
          color={isAvailable ? 'brandInk' : 'ink2'}
        />
      </View>
      <View style={GENERATE_QR_TEXT_STYLE}>
        <Text variant="bodyStrong" color={contentColor}>
          {i18n.t('attendance.generateQr.action')}
        </Text>
        <Text variant="caption" color={isAvailable ? 'onBrand' : 'ink2'}>
          {buildStatusHint(availability, timeZone)}
        </Text>
      </View>
      {isAvailable ? <Icon name="chevronRight" size="navigation" color="onBrand" /> : null}
    </Pressable>
  );
}
