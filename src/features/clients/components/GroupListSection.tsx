import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { LoadErrorState } from '@/features/join';
import type { GroupListResponseDtoGroupsItem } from '@/shared/api/generated/model';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Button } from '@/ui/atoms/Button';
import { EmptyState } from '@/ui/molecules/EmptyState';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';

import type { useGroupList } from '../hooks/useGroupList';
import { GroupCard } from './GroupCard';
import { CREATE_GROUP_ROW_STYLE } from './GroupListSection.styles';

interface GroupListSectionProps {
  groups: ReturnType<typeof useGroupList>;
  sectorId: string | undefined;
}

interface GroupRowsProps {
  groups: readonly GroupListResponseDtoGroupsItem[];
  levelWords: readonly [string, string, string];
  onCreate: () => void;
}

function GroupRows({ groups, levelWords, onCreate }: Readonly<GroupRowsProps>): React.JSX.Element {
  const router = useRouter();

  return (
    <>
      {groups.map((group) => (
        <GroupCard
          key={group.id}
          group={group}
          levelWords={levelWords}
          onPress={() => {
            router.push({ pathname: '/(admin)/groups/[groupId]', params: { groupId: group.id } });
          }}
        />
      ))}
      <View style={CREATE_GROUP_ROW_STYLE}>
        <Button
          size="lg"
          leadingIconName="plus"
          label={i18n.t('clients.groups.createAction')}
          onPress={onCreate}
        />
      </View>
    </>
  );
}

/** Los grupos del centro con «Crear grupo»; cada tarjeta abre el grupo. */
export function GroupListSection({
  groups,
  sectorId,
}: Readonly<GroupListSectionProps>): React.JSX.Element {
  const router = useRouter();
  const vocabulary = getSectorVocabulary(sectorId);
  const openNewGroup = (): void => {
    router.push('/(admin)/groups/new');
  };

  if (groups.isError) {
    return (
      <LoadErrorState
        title={i18n.t('clients.groups.loadError')}
        error={groups.error}
        onRetry={() => void groups.refetch()}
        isRetrying={groups.isFetching}
      />
    );
  }
  if (groups.isPending) return <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />;
  if (groups.data.groups.length === 0) {
    return (
      <EmptyState
        iconName="users"
        title={i18n.t('clients.groups.emptyTitle')}
        description={i18n.t('clients.groups.emptyDescription', {
          clientWord: vocabulary.client.plural,
        })}
        actionLabel={i18n.t('clients.groups.createAction')}
        onActionPress={openNewGroup}
      />
    );
  }
  return (
    <GroupRows groups={groups.data.groups} levelWords={vocabulary.levels} onCreate={openNewGroup} />
  );
}
