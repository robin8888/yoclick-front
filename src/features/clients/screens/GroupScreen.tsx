import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';

import { useActiveCenterSectorId } from '@/features/join';
import type { GroupListResponseDtoGroupsItem } from '@/shared/api/generated/model';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { ClientListSection } from '../components/ClientListSection';
import { RemoveGroupControl } from '../components/RemoveGroupControl';
import { useClientList } from '../hooks/useClientList';
import { useArchiveGroup } from '../hooks/useClientMutations';
import { useGroupList } from '../hooks/useGroupList';
import { describeClientLevel } from '../model/client-display';
import { parseGroupRouteParams } from '../model/client-route-params';

function describeGroupSummary(
  group: GroupListResponseDtoGroupsItem | undefined,
  levelWords: readonly [string, string, string],
): string {
  return i18n.t('clients.groups.cardSummary', {
    members: i18n.t('clients.groups.memberCount', { count: group?.memberCount ?? 0 }),
    instructor: group?.instructor?.fullName ?? i18n.t('clients.groups.noInstructor'),
    level:
      describeClientLevel(group?.level ?? null, levelWords) ?? i18n.t('clients.groups.noLevel'),
  });
}

interface GroupMembersProps {
  groupId: string;
  isEmpty: boolean;
  sectorId: string | undefined;
}

function GroupMembers({
  groupId,
  isEmpty,
  sectorId,
}: Readonly<GroupMembersProps>): React.JSX.Element {
  const members = useClientList({ searchText: '', statusFilter: 'all', groupId });

  return (
    <>
      <Text variant="titleMd" role="heading">
        {i18n.t('clients.groupDetail.membersTitle')}
      </Text>
      {isEmpty ? (
        <Text color="ink2">{i18n.t('clients.groupDetail.noMembers')}</Text>
      ) : (
        <ClientListSection list={members} sectorId={sectorId} isFiltered />
      )}
    </>
  );
}

interface GroupContentProps {
  groupId: string;
}

function GroupContent({ groupId }: Readonly<GroupContentProps>): React.JSX.Element {
  const router = useRouter();
  const sectorId = useActiveCenterSectorId();
  const group = useGroupList().data?.groups.find((candidate) => candidate.id === groupId);
  const archive = useArchiveGroup(router.back);

  return (
    <ScreenTemplate
      title={group?.name ?? i18n.t('clients.groupDetail.title')}
      subtitle={describeGroupSummary(group, getSectorVocabulary(sectorId).levels)}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      isLoading={archive.isRunning}
    >
      <GroupMembers groupId={groupId} isEmpty={group?.memberCount === 0} sectorId={sectorId} />
      {archive.errorMessage === null ? null : <FormErrorBanner message={archive.errorMessage} />}
      {group === undefined ? null : (
        <RemoveGroupControl
          groupName={group.name}
          isRemoving={archive.isRunning}
          onRemoveConfirm={() => {
            archive.run(groupId);
          }}
        />
      )}
    </ScreenTemplate>
  );
}

/** Prototipo `agroup`: sus miembros y «Quitar grupo». */
export function GroupScreen(): React.JSX.Element {
  const routeParams = parseGroupRouteParams(useLocalSearchParams());
  if (routeParams === null) return <Redirect href="/(admin)/(tabs)/clients" />;
  return <GroupContent groupId={routeParams.groupId} />;
}
