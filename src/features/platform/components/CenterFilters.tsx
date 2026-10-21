import { ScrollView } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Chip } from '@/ui/atoms/Chip';
import { FormField } from '@/ui/molecules/FormField';

export type CenterStatusFilter = 'all' | 'trial' | 'active' | 'past_due' | 'suspended';

const STATUS_FILTERS: readonly CenterStatusFilter[] = [
  'all',
  'trial',
  'active',
  'past_due',
  'suspended',
];
const FILTER_CHIPS_STYLE = { flexDirection: 'row', gap: 8 } as const;

interface CenterFiltersProps {
  searchText: string;
  onSearchTextChange: (nextText: string) => void;
  selectedStatus: CenterStatusFilter;
  onStatusSelect: (status: CenterStatusFilter) => void;
}

function getFilterLabel(status: CenterStatusFilter): string {
  return status === 'all'
    ? i18n.t('platform.centers.allStatuses')
    : i18n.t(`platform.status.${status}`);
}

/** Buscar por nombre y filtrar por estado. Los filtros los aplica el servidor. */
export function CenterFilters({
  searchText,
  onSearchTextChange,
  selectedStatus,
  onStatusSelect,
}: Readonly<CenterFiltersProps>): React.JSX.Element {
  return (
    <>
      <FormField
        label={i18n.t('platform.centers.searchLabel')}
        value={searchText}
        onChangeText={onSearchTextChange}
        autoCapitalize="none"
        leadingIconName="search"
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        accessibilityLabel={i18n.t('platform.centers.statusFilterLabel')}
        contentContainerStyle={FILTER_CHIPS_STYLE}
      >
        {STATUS_FILTERS.map((status) => (
          <Chip
            key={status}
            selectionRole="radio"
            label={getFilterLabel(status)}
            isSelected={status === selectedStatus}
            onPress={() => {
              onStatusSelect(status);
            }}
          />
        ))}
      </ScrollView>
    </>
  );
}
