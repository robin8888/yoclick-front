import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Button } from '@/ui/atoms/Button';
import { Icon, type IconName } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import {
  createHeroDetailsStyle,
  createHeroDetailStyle,
  createHeroStyle,
} from './NextAppointmentHero.styles';

interface HeroDetailProps {
  iconName: IconName;
  label: string;
}

function HeroDetail({ iconName, label }: Readonly<HeroDetailProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createHeroDetailStyle(theme)}>
      <Icon name={iconName} color="onBrand" />
      <Text variant="bodyStrong" color="onBrand">
        {label}
      </Text>
    </View>
  );
}

interface NextAppointmentHeroProps {
  serviceName: string;
  staffName: string;
  dateLabel: string;
  timeAndDurationLabel: string;
}

/** Prototipo `home`: la próxima cita sobre el color del centro (texto siempre `onBrand`). */
export function NextAppointmentHero({
  serviceName,
  staffName,
  dateLabel,
  timeAndDurationLabel,
}: Readonly<NextAppointmentHeroProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createHeroStyle(theme)}>
      <Text variant="overline" color="onBrand">
        {i18n.t('booking.home.nextAppointment')}
      </Text>
      <Text variant="titleLg" color="onBrand">
        {serviceName}
      </Text>
      <Text color="onBrand">{i18n.t('booking.list.withStaff', { staffName })}</Text>
      <View style={createHeroDetailsStyle(theme)}>
        <HeroDetail iconName="calendar" label={dateLabel} />
        <HeroDetail iconName="clock" label={timeAndDurationLabel} />
      </View>
    </View>
  );
}

interface NoAppointmentHeroProps {
  onBookAction: () => void;
}

/** Sin cita próxima, el mismo hueco invita a reservar. */
export function NoAppointmentHero({
  onBookAction,
}: Readonly<NoAppointmentHeroProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createHeroStyle(theme)}>
      <Text variant="overline" color="onBrand">
        {i18n.t('booking.home.nextAppointment')}
      </Text>
      <Text variant="titleMd" color="onBrand">
        {i18n.t('booking.home.noNextAppointment')}
      </Text>
      <Button
        variant="secondary"
        label={i18n.t('booking.home.bookAction')}
        onPress={onBookAction}
      />
    </View>
  );
}
