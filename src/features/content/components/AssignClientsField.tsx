import { View } from 'react-native';

import { ClientPicker } from '@/features/clients';
import { i18n } from '@/shared/i18n';
import { Chip } from '@/ui/atoms/Chip';
import { Text } from '@/ui/atoms/Text';

import type { AssignmentDraft, DraftClient } from '../model/assignment-draft';
import { STACK_STYLE, WRAP_ROW_STYLE } from './Content.styles';

interface AssignClientsFieldProps {
  draft: AssignmentDraft;
  clientWord: string;
  onClientAdd: (client: DraftClient) => void;
  onClientRemove: (membershipId: string) => void;
}

/** «Por cliente»: quienes ya están elegidos (con su quitar) y el buscador para añadir a otros. */
export function AssignClientsField({
  draft,
  clientWord,
  onClientAdd,
  onClientRemove,
}: Readonly<AssignClientsFieldProps>): React.JSX.Element {
  return (
    <View style={STACK_STYLE}>
      <Text variant="bodyStrong">{i18n.t('content.assign.byClient', { client: clientWord })}</Text>
      {draft.clients.length === 0 ? null : (
        <View style={WRAP_ROW_STYLE}>
          {draft.clients.map((client) => (
            <Chip
              key={client.membershipId}
              selectionRole="checkbox"
              label={client.name}
              accessibilityLabel={i18n.t('content.assign.removeClientLabel', { name: client.name })}
              isSelected
              onPress={() => {
                onClientRemove(client.membershipId);
              }}
            />
          ))}
        </View>
      )}
      <ClientPicker
        onClientSelect={(client) => {
          onClientAdd({ membershipId: client.membershipId, name: client.fullName });
        }}
      />
    </View>
  );
}
