import { View } from 'react-native';

import type { SessionWaitlistResponseDtoEntriesItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Avatar } from '@/ui/atoms/Avatar';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';

import { RemoveFromWaitlistSheet } from './RemoveFromWaitlistSheet';
import { useWaitlistRemovalFlow } from '../hooks/useWaitlistRemovalFlow';
import { useSessionWaitlist } from '../hooks/useSessionWaitlist';
import { buildWaitlistStatusLabel } from '../model/waitlist-labels';
import {
  createPanelStyle,
  createPersonRowStyle,
  PERSON_TEXT_STYLE,
} from './SessionWaitlistPanel.styles';

interface SessionWaitlistPanelProps {
  classSessionId: string;
  timeZone: string;
}

function WaitingPersonRow({
  person,
  timeZone,
  onRemovePress,
}: Readonly<{
  person: SessionWaitlistResponseDtoEntriesItem;
  timeZone: string;
  onRemovePress: () => void;
}>): React.JSX.Element {
  const theme = useTheme();
  return (
    <View style={createPersonRowStyle(theme)}>
      <Avatar name={person.client.fullName} photoUrl={null} size="md" isDecorative />
      <View style={PERSON_TEXT_STYLE}>
        <Text numberOfLines={1}>{person.client.fullName}</Text>
        <Text variant="caption" color="ink2">
          {buildWaitlistStatusLabel(person, timeZone)}
        </Text>
      </View>
      <Button
        size="sm"
        variant="outline"
        label={i18n.t('waitlist.removeAction')}
        accessibilityLabel={i18n.t('waitlist.removeActionLabel', { name: person.client.fullName })}
        onPress={onRemovePress}
      />
    </View>
  );
}

/**
 * Quién espera una plaza en la clase: primero a quien ya se le ofreció (con su plazo) y luego la
 * cola por orden de llegada. Sin nadie esperando, o si no carga, no ocupa sitio en la pantalla.
 */
export function SessionWaitlistPanel({
  classSessionId,
  timeZone,
}: Readonly<SessionWaitlistPanelProps>): React.JSX.Element | null {
  const theme = useTheme();
  const { data: waitlist } = useSessionWaitlist(classSessionId);
  const removal = useWaitlistRemovalFlow(classSessionId);
  if (waitlist === undefined || waitlist.entries.length === 0) return null;

  return (
    <View style={createPanelStyle(theme)}>
      <Text variant="titleMd" role="heading">
        {i18n.t('waitlist.staffSectionTitle', { count: waitlist.entries.length })}
      </Text>
      {waitlist.entries.map((person) => (
        <WaitingPersonRow
          key={person.id}
          person={person}
          timeZone={timeZone}
          onRemovePress={() => {
            removal.askToRemove(person);
          }}
        />
      ))}
      {removal.errorMessage === null ? null : <FormErrorBanner message={removal.errorMessage} />}
      <RemoveFromWaitlistSheet
        person={removal.personToRemove}
        isRemoving={removal.isRemoving}
        onConfirm={removal.confirmRemoval}
        onDismiss={removal.dismissRemoval}
      />
    </View>
  );
}
