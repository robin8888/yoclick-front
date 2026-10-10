import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';
import { OptionCard } from '@/ui/molecules/OptionCard';

import { useServiceCatalog } from '../hooks/useServiceCatalog';
import { toggleServiceSelection } from '../model/service-selection';

const FIELD_STYLE = { gap: 8 } as const;

interface ServiceSelectionFieldProps {
  title: string;
  helperText: string;
  selectedServiceIds: readonly string[];
  onSelectedServiceIdsChange: (serviceIds: string[]) => void;
}

/** Los servicios de la academia como casillas: se marcan los que corresponden. */
export function ServiceSelectionField({
  title,
  helperText,
  selectedServiceIds,
  onSelectedServiceIdsChange,
}: Readonly<ServiceSelectionFieldProps>): React.JSX.Element {
  const services = useServiceCatalog().data?.services ?? [];

  return (
    <View style={FIELD_STYLE}>
      <Text variant="bodyStrong">{title}</Text>
      <Text variant="caption" color="ink2">
        {helperText}
      </Text>
      {services.length === 0 ? (
        <Text color="ink2">{i18n.t('centerAdmin.serviceSelection.empty')}</Text>
      ) : null}
      {services.map((service) => (
        <OptionCard
          key={service.id}
          title={service.name}
          selectionMode="multiple"
          isSelected={selectedServiceIds.includes(service.id)}
          onPress={() => {
            onSelectedServiceIdsChange(toggleServiceSelection(selectedServiceIds, service.id));
          }}
        />
      ))}
    </View>
  );
}
