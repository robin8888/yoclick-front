import { Pressable, View } from 'react-native';

import { LoadErrorState } from '@/features/join';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { useTheme } from '@/shared/theme';
import { Avatar } from '@/ui/atoms/Avatar';
import { Icon } from '@/ui/atoms/Icon';
import { Input } from '@/ui/atoms/Input';
import { Text } from '@/ui/atoms/Text';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';

import { useClientFilters } from '../hooks/useClientFilters';
import { useClientList } from '../hooks/useClientList';
import { CLIENT_ROW_TEXT_STYLE, createClientRowStyle } from './ClientRow.styles';
import { CLIENT_PICKER_STYLE } from './ClientPicker.styles';

interface PickableClient {
  membershipId: string;
  fullName: string;
  photoUrl: string | null;
}

interface ClientPickerProps {
  onClientSelect: (client: PickableClient) => void;
  /** Quienes ya están elegidos: salen marcados (con check y fondo de marca) y se pueden volver a pulsar. */
  selectedMembershipIds?: readonly string[];
  /** Por defecto, alumnos; con `all` salen también las familias (elegir a un tutor). */
  kind?: 'students' | 'guardians' | 'all';
}

interface PickerRowProps {
  client: PickableClient;
  isSelected: boolean;
  onPress: () => void;
}

function PickerRow({ client, isSelected, onPress }: Readonly<PickerRowProps>): React.JSX.Element {
  const theme = useTheme();
  const rowStyle = createClientRowStyle(theme);

  return (
    <Pressable
      role="button"
      accessibilityLabel={client.fullName}
      accessibilityState={{ selected: isSelected }}
      onPress={onPress}
      style={[
        rowStyle,
        isSelected && {
          backgroundColor: theme.colors.brandSoft,
          borderColor: theme.colors.brandInk,
        },
      ]}
    >
      <Avatar name={client.fullName} photoUrl={client.photoUrl} size="md" isDecorative />
      <View style={CLIENT_ROW_TEXT_STYLE}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {client.fullName}
        </Text>
      </View>
      {isSelected ? <Icon name="checkCircle" color="brandInk" /> : null}
    </Pressable>
  );
}

function PickerList({
  list,
  onClientSelect,
  selectedMembershipIds,
}: Readonly<{
  list: ReturnType<typeof useClientList>;
  onClientSelect: ClientPickerProps['onClientSelect'];
  selectedMembershipIds: readonly string[];
}>): React.JSX.Element {
  const clients = list.data?.pages.flatMap((page) => page.clients) ?? [];

  if (list.isError) {
    return (
      <LoadErrorState
        title={i18n.t('clients.loadError')}
        error={list.error}
        onRetry={() => void list.refetch()}
        isRetrying={list.isFetching}
      />
    );
  }
  if (list.isPending) return <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />;
  if (clients.length === 0) return <Text color="ink2">{i18n.t('clients.noResultsTitle')}</Text>;
  return (
    <>
      {clients.map((client) => (
        <PickerRow
          key={client.membershipId}
          client={client}
          isSelected={selectedMembershipIds.includes(client.membershipId)}
          onPress={() => {
            onClientSelect(client);
          }}
        />
      ))}
    </>
  );
}

/** Buscador y lista corta para elegir a la persona a la que se le pone una cita. */
export function ClientPicker({
  onClientSelect,
  selectedMembershipIds = [],
  kind,
}: Readonly<ClientPickerProps>): React.JSX.Element {
  const filters = useClientFilters();
  const list = useClientList({
    searchText: filters.searchText,
    statusFilter: 'all',
    scope: 'center',
    ...(kind === undefined ? {} : { kind }),
  });

  return (
    <View style={CLIENT_PICKER_STYLE}>
      <Input
        value={filters.searchText}
        onChangeText={filters.changeSearchText}
        accessibilityLabel={i18n.t('clients.search.label')}
        placeholder={i18n.t('clients.search.placeholder')}
        leadingIconName="search"
        autoCapitalize="none"
        returnKeyType="search"
      />
      <PickerList
        list={list}
        onClientSelect={onClientSelect}
        selectedMembershipIds={selectedMembershipIds}
      />
    </View>
  );
}
