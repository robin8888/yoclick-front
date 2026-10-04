import type { MyMembershipsResponseDtoMembershipsItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { Avatar } from '@/ui/atoms/Avatar';
import { EmptyState } from '@/ui/molecules/EmptyState';
import { ListItem } from '@/ui/molecules/ListItem';

interface MyCentersListProps {
  memberships: readonly MyMembershipsResponseDtoMembershipsItem[];
  activeCenterId: string | null;
  onCenterSelect: (centerId: string) => void;
  onJoinCenterRequest: () => void;
}

export function MyCentersList({
  memberships,
  activeCenterId,
  onCenterSelect,
  onJoinCenterRequest,
}: Readonly<MyCentersListProps>): React.JSX.Element {
  if (memberships.length === 0) {
    return (
      <EmptyState
        iconName="users"
        title={i18n.t('join.centers.emptyTitle')}
        description={i18n.t('join.centers.emptyDescription')}
        actionLabel={i18n.t('join.centers.emptyActionLabel')}
        onActionPress={onJoinCenterRequest}
      />
    );
  }
  return (
    <>
      {memberships.map((membership) => {
        const isActiveCenter = membership.centerId === activeCenterId;
        return (
          <ListItem
            key={membership.membershipId}
            leading={<Avatar name={membership.center.name} isDecorative />}
            title={membership.center.name}
            subtitle={isActiveCenter ? i18n.t('join.centers.currentCenter') : undefined}
            isSelected={isActiveCenter}
            onPress={() => {
              onCenterSelect(membership.centerId);
            }}
          />
        );
      })}
    </>
  );
}
