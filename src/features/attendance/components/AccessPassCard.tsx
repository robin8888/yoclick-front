import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { formatShortDate } from '@/shared/lib/format/format-short-date';
import { formatTime24h } from '@/shared/lib/format/format-time';
import { useTheme } from '@/shared/theme';
import { Avatar } from '@/ui/atoms/Avatar';
import { Text } from '@/ui/atoms/Text';
import { QrCard } from '@/ui/organisms/QrCard';

import { ACCESS_PASS_HOLDER_STYLE, createAccessPassCardStyle } from './AccessPassCard.styles';

const ACCESS_QR_SIZE = 200;

interface AccessPassCardProps {
  fullName: string;
  centerName: string;
  qrContent: string;
  nextAppointment: { serviceName: string; startsAt: string } | undefined;
  timeZone: string;
}

/** Prototipo `checkin`: quién es, el QR y para qué cita lo enseña. */
export function AccessPassCard({
  fullName,
  centerName,
  qrContent,
  nextAppointment,
  timeZone,
}: Readonly<AccessPassCardProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createAccessPassCardStyle(theme)}>
      <Avatar name={fullName} size="xl" isDecorative />
      <View style={ACCESS_PASS_HOLDER_STYLE}>
        <Text variant="titleMd">{fullName}</Text>
        <Text variant="caption" color="ink2">
          {centerName}
        </Text>
      </View>
      <QrCard
        value={qrContent}
        size={ACCESS_QR_SIZE}
        accessibilityLabel={i18n.t('attendance.accessQr.qrLabel')}
      />
      {nextAppointment === undefined ? null : (
        <Text variant="caption" color="ink2" align="center">
          {i18n.t('attendance.accessQr.nextAppointment', {
            serviceName: nextAppointment.serviceName,
            date: formatShortDate(nextAppointment.startsAt, timeZone),
            time: formatTime24h(nextAppointment.startsAt, timeZone),
          })}
        </Text>
      )}
    </View>
  );
}
