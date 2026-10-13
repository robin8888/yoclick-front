import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { formatEuros } from '@/shared/lib/format';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { OptionCard } from '@/ui/molecules/OptionCard';

import { useAssignPass } from '../hooks/useAssignPass';
import { useRateOffers } from '../hooks/useRateOffers';

const OPTIONS_STYLE = { gap: 8 } as const;

interface AssignPassOptionsProps {
  clientMembershipId: string;
  onAssigned: () => void;
}

/** Los bonos del centro como opciones: al tocar uno, se entrega ya activo a la persona. */
export function AssignPassOptions({
  clientMembershipId,
  onAssigned,
}: Readonly<AssignPassOptionsProps>): React.JSX.Element {
  const rates = useRateOffers().data?.rates ?? [];
  const assignment = useAssignPass(clientMembershipId);

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
          isSelected={false}
          onPress={() => {
            if (!assignment.isAssigning) assignment.assignPass(rate.id, onAssigned);
          }}
        />
      ))}
      {assignment.errorMessage === null ? null : (
        <FormErrorBanner message={assignment.errorMessage} />
      )}
    </View>
  );
}
