import { Pressable, View } from 'react-native';

import { LoadErrorState } from '@/features/join';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { useTheme } from '@/shared/theme';
import { Avatar } from '@/ui/atoms/Avatar';
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
}

interface ClientPickerProps {
  onClientSelect: (client: PickableClient) => void;
}

interface PickerRowProps {
  client: PickableClient;
  onPress: () => void;
}

function PickerRow({ client, onPress }: Readonly<PickerRowProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <Pressable
      role="button"
      accessibilityLabel={client.fullName}
      onPress={onPress}
      style={createClientRowStyle(theme)}
    >
      <Avatar name={client.fullName} size="md" isDecorative />
      <View style={CLIENT_ROW_TEXT_STYLE}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {client.fullName}
        </Text>
      </View>
    </Pressable>
  );
}

function PickerList({
  list,
  onClientSelect,
}: Readonly<{
  list: ReturnType<typeof useClientList>;
  onClientSelect: ClientPickerProps['onClientSelect'];
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
          onPress={() => {
            onClientSelect(client);
          }}
        />
      ))}
    </>
  );
}

/** Buscador y lista corta para elegir a la persona a la que se le pone una cita. */
export function ClientPicker({ onClientSelect }: Readonly<ClientPickerProps>): React.JSX.Element {
  const filters = useClientFilters();
  const list = useClientList({ searchText: filters.searchText, statusFilter: 'all' });

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
      <PickerList list={list} onClientSelect={onClientSelect} />
    </View>
  );
}
