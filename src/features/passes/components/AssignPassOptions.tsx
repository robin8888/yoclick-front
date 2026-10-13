import { useState } from 'react';
import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { formatEuros } from '@/shared/lib/format';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { OptionCard } from '@/ui/molecules/OptionCard';

import { useAssignPass } from '../hooks/useAssignPass';
import { useRateOffers } from '../hooks/useRateOffers';

const OPTIONS_STYLE = { gap: 8 } as const;

interface AssignPassOptionsProps {
  clientMembershipId: string;
  onAssigned: () => void;
  onCancel: () => void;
}

interface AssignActionsProps {
  isReady: boolean;
  isAssigning: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** «Asignar bono» (activo solo con uno elegido) y «Cancelar». */
function AssignActions({
  isReady,
  isAssigning,
  onConfirm,
  onCancel,
}: Readonly<AssignActionsProps>): React.JSX.Element {
  return (
    <>
      <Button
        isFullWidth
        label={i18n.t('passes.assign.confirmAction')}
        isDisabled={!isReady}
        isLoading={isAssigning}
        onPress={onConfirm}
      />
      <Button
        isFullWidth
        variant="ghost"
        label={i18n.t('actions.cancel')}
        isDisabled={isAssigning}
        onPress={onCancel}
      />
    </>
  );
}

/**
 * Elegir el bono y confirmarlo con «Asignar bono»: tocar una opción solo la marca, así un toque de
 * más no crea otro bono. Mientras el servidor responde, el botón no se puede volver a pulsar.
 */
export function AssignPassOptions({
  clientMembershipId,
  onAssigned,
  onCancel,
}: Readonly<AssignPassOptionsProps>): React.JSX.Element {
  const rates = useRateOffers().data?.rates ?? [];
  const assignment = useAssignPass(clientMembershipId);
  const [chosenRateId, setChosenRateId] = useState<string | null>(null);

  return (
    <View style={OPTIONS_STYLE}>
      {rates.length === 0 ? <Text color="ink2">{i18n.t('passes.assign.noRates')}</Text> : null}
      {rates.map((rate) => (
        <OptionCard
          key={rate.id}
          title={rate.name}
          description={i18n.t('passes.assign.rateSummary', {
            count: rate.sessionsCount,
            price: formatEuros(rate.priceCents),
          })}
          selectionMode="single"
          isSelected={rate.id === chosenRateId}
          onPress={() => {
            setChosenRateId(rate.id);
          }}
        />
      ))}
      {assignment.errorMessage === null ? null : (
        <FormErrorBanner message={assignment.errorMessage} />
      )}
      <AssignActions
        isReady={chosenRateId !== null}
        isAssigning={assignment.isAssigning}
        onConfirm={() => {
          if (chosenRateId !== null) assignment.assignPass(chosenRateId, onAssigned);
        }}
        onCancel={onCancel}
      />
    </View>
  );
}
