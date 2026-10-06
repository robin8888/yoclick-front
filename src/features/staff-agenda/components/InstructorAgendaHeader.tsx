import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { NotificationBell } from '@/features/notifications';
import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';
import { HeaderIconButton } from '@/ui/molecules/HeaderIconButton';

import {
  HEADER_ACTIONS_STYLE,
  HEADER_STYLE,
  HEADER_TEXT_STYLE,
} from './InstructorAgendaHeader.styles';

/** Prototipo `iagenda`: «Mi agenda» con el escáner y la campana de avisos (la marca va arriba). */
export function InstructorAgendaHeader(): React.JSX.Element {
  const router = useRouter();

  return (
    <View style={HEADER_STYLE}>
      <View style={HEADER_TEXT_STYLE}>
        <Text variant="titleLg" role="heading">
          {i18n.t('staffAgenda.agenda.staffTitle')}
        </Text>
      </View>
      <View style={HEADER_ACTIONS_STYLE}>
        <HeaderIconButton
          iconName="qrCode"
          accessibilityLabel={i18n.t('attendance.scan.openAction')}
          onPress={() => {
            router.push('/(staff)/scan');
          }}
        />
        <NotificationBell href="/(staff)/(tabs)/notifications" />
      </View>
    </View>
  );
}
