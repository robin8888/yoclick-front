import { useState } from 'react';
import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';

import { useClientPasses } from '../hooks/useClientPasses';
import { AssignPassOptions } from './AssignPassOptions';
import { MyPassCard } from './MyPassCard';

const SECTION_STYLE = { gap: 12 } as const;

interface ClientPassesSectionProps {
  clientMembershipId: string;
}

/** En la ficha de una persona: sus bonos y «Dar un bono» (se entrega ya activo, cobrado aparte). */
export function ClientPassesSection({
  clientMembershipId,
}: Readonly<ClientPassesSectionProps>): React.JSX.Element {
  const [isChoosing, setIsChoosing] = useState(false);
  const passes = (useClientPasses(clientMembershipId).data?.passes ?? []).filter(
    ({ status }) => status !== 'rejected',
  );

  return (
    <View style={SECTION_STYLE}>
      <Text variant="titleMd" role="heading">
        {i18n.t('passes.assign.title')}
      </Text>
      {passes.length === 0 ? <Text color="ink2">{i18n.t('passes.assign.empty')}</Text> : null}
      {passes.map((pass) => (
        <MyPassCard key={pass.id} pass={pass} />
      ))}
      {isChoosing ? (
        <AssignPassOptions
          clientMembershipId={clientMembershipId}
          onAssigned={() => {
            setIsChoosing(false);
          }}
        />
      ) : (
        <Button
          variant="outline"
          leadingIconName="plus"
          label={i18n.t('passes.assign.action')}
          onPress={() => {
            setIsChoosing(true);
          }}
        />
      )}
    </View>
  );
}
