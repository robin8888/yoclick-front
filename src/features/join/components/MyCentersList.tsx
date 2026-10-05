import type { MyMembershipsResponseDtoMembershipsItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { EmptyState } from '@/ui/molecules/EmptyState';

import { MyCenterRow } from './MyCenterRow';

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
      {memberships.map((membership) => (
        <MyCenterRow
          key={membership.membershipId}
          membership={membership}
          isActiveCenter={membership.centerId === activeCenterId}
          onPress={() => {
            onCenterSelect(membership.centerId);
          }}
        />
      ))}
    </>
  );
}
