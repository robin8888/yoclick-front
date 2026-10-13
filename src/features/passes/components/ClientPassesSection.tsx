import { useState } from 'react';
import { View } from 'react-native';

import type { PassListResponseDtoPassesItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';

import { useClientPasses } from '../hooks/useClientPasses';
import { AssignPassOptions } from './AssignPassOptions';
import { MyPassCard } from './MyPassCard';
import { RemovePassSheet } from './RemovePassSheet';

const SECTION_STYLE = { gap: 12 } as const;

interface ClientPassesSectionProps {
  clientMembershipId: string;
}

/** «Quitar bono» bajo cada bono de la ficha. */
function RemovePassButton({
  pass,
  onPress,
}: Readonly<{ pass: PassListResponseDtoPassesItem; onPress: () => void }>): React.JSX.Element {
  return (
    <Button
      isFullWidth
      size="sm"
      variant="outline"
      leadingIconName="trash"
      label={i18n.t('passes.assign.removeAction')}
      accessibilityLabel={i18n.t('passes.assign.removeLabel', { name: pass.name })}
      onPress={onPress}
    />
  );
}

/** «Dar un bono» y, al pulsarlo, las opciones para elegir y confirmar. */
function AssignPassEntry({
  clientMembershipId,
}: Readonly<{ clientMembershipId: string }>): React.JSX.Element {
  const [isChoosing, setIsChoosing] = useState(false);

  if (!isChoosing) {
    return (
      <Button
        variant="outline"
        leadingIconName="plus"
        label={i18n.t('passes.assign.action')}
        onPress={() => {
          setIsChoosing(true);
        }}
      />
    );
  }
  return (
    <AssignPassOptions
      clientMembershipId={clientMembershipId}
      onAssigned={() => {
        setIsChoosing(false);
      }}
      onCancel={() => {
        setIsChoosing(false);
      }}
    />
  );
}

/**
 * En la ficha de una persona: sus bonos, cada uno con «Quitar bono», y «Dar un bono» (se entrega
 * ya activo, cobrado aparte). Para asignar se elige el bono y se confirma.
 */
export function ClientPassesSection({
  clientMembershipId,
}: Readonly<ClientPassesSectionProps>): React.JSX.Element {
  const [passToRemove, setPassToRemove] = useState<PassListResponseDtoPassesItem | null>(null);
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
        <MyPassCard
          key={pass.id}
          pass={pass}
          actions={
            <RemovePassButton
              pass={pass}
              onPress={() => {
                setPassToRemove(pass);
              }}
            />
          }
        />
      ))}
      <AssignPassEntry clientMembershipId={clientMembershipId} />
      <RemovePassSheet
        pass={passToRemove}
        onClose={() => {
          setPassToRemove(null);
        }}
      />
    </View>
  );
}
