import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Button } from '@/ui/atoms/Button';
import { Icon, type IconName } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import {
  createHeroDetailsStyle,
  createHeroDetailStyle,
  createHeroStyle,
  HERO_DECORATION_SIZE,
  HERO_DECORATION_STYLE,
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

const RING_VIEW_BOX = '0 0 100 100';
const RING_CENTER = 50;
const RING_RADIUS = 46;
const RING_STROKE_WIDTH = 14;

/** Anillo del prototipo, tenue y cortado por la esquina superior derecha. */
function HeroDecoration(): React.JSX.Element {
  const theme = useTheme();

  return (
    <View
      style={HERO_DECORATION_STYLE}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Svg width={HERO_DECORATION_SIZE} height={HERO_DECORATION_SIZE} viewBox={RING_VIEW_BOX}>
        <Circle
          cx={RING_CENTER}
          cy={RING_CENTER}
          r={RING_RADIUS}
          fill="none"
          stroke={theme.colors.onBrand}
          strokeWidth={RING_STROKE_WIDTH}
        />
      </Svg>
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
      <HeroDecoration />
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
