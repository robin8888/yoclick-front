import { View } from 'react-native';

import { NotificationBell } from '@/features/notifications';
import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';

import {
  HEADER_ACTIONS_STYLE,
  HEADER_STYLE,
  HEADER_TEXT_STYLE,
} from './InstructorAgendaHeader.styles';

/** Prototipo `iagenda`: «Mi agenda» con la campana de avisos (la marca va arriba). */
export function InstructorAgendaHeader(): React.JSX.Element {
  return (
    <View style={HEADER_STYLE}>
      <View style={HEADER_TEXT_STYLE}>
        <Text variant="titleLg" role="heading">
          {i18n.t('staffAgenda.agenda.staffTitle')}
        </Text>
      </View>
      <View style={HEADER_ACTIONS_STYLE}>
        <NotificationBell href="/(staff)/(tabs)/notifications" />
      </View>
    </View>
  );
}
