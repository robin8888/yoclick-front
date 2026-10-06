import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { IconButton } from '@/ui/atoms/IconButton';
import { Input } from '@/ui/atoms/Input';

import { CLIENT_STATUS_FILTER_IDS, type ClientStatusFilterId } from '../model/client-display';
import { FILTER_BUTTONS_STYLE, SEARCH_INPUT_STYLE, SEARCH_ROW_STYLE } from './ClientFilters.styles';

const STATUS_FILTER_TEXT_KEYS = {
  all: 'clients.statusFilters.all',
  active: 'clients.statusFilters.active',
  new: 'clients.statusFilters.new',
  inactive: 'clients.statusFilters.inactive',
  blocked: 'clients.statusFilters.blocked',
} as const satisfies Record<ClientStatusFilterId, string>;

interface StatusFilterButtonsProps {
  statusFilter: ClientStatusFilterId;
  onStatusFilterChange: (statusFilter: ClientStatusFilterId) => void;
}

function StatusFilterButtons({
  statusFilter,
  onStatusFilterChange,
}: Readonly<StatusFilterButtonsProps>): React.JSX.Element {
  return (
    <View accessibilityLabel={i18n.t('clients.statusFilterLabel')} style={FILTER_BUTTONS_STYLE}>
      {CLIENT_STATUS_FILTER_IDS.map((filterId) => (
        <Button
          key={filterId}
          size="sm"
          variant={filterId === statusFilter ? 'primary' : 'outline'}
          label={i18n.t(STATUS_FILTER_TEXT_KEYS[filterId])}
          onPress={() => {
            onStatusFilterChange(filterId);
          }}
        />
      ))}
    </View>
  );
}

interface ClientFiltersProps {
  searchText: string;
  statusFilter: ClientStatusFilterId;
  /** «Invitar alumnos», con el vocabulario del sector. */
  inviteLabel: string;
  onSearchTextChange: (searchText: string) => void;
  onStatusFilterChange: (statusFilter: ClientStatusFilterId) => void;
  onInvitePress: () => void;
}

/** El buscador por nombre o correo, el «+» para invitar y el filtro por estado. */
export function ClientFilters({
  searchText,
  statusFilter,
  inviteLabel,
  onSearchTextChange,
  onStatusFilterChange,
  onInvitePress,
}: Readonly<ClientFiltersProps>): React.JSX.Element {
  return (
    <>
      <View style={SEARCH_ROW_STYLE}>
        <View style={SEARCH_INPUT_STYLE}>
          <Input
            value={searchText}
            onChangeText={onSearchTextChange}
            accessibilityLabel={i18n.t('clients.search.label')}
            placeholder={i18n.t('clients.search.placeholder')}
            leadingIconName="search"
            autoCapitalize="none"
            returnKeyType="search"
          />
        </View>
        <IconButton
          iconName="plus"
          variant="tonal"
          accessibilityLabel={inviteLabel}
          onPress={onInvitePress}
        />
      </View>
      <StatusFilterButtons
        statusFilter={statusFilter}
        onStatusFilterChange={onStatusFilterChange}
      />
    </>
  );
}
