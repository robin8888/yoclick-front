import type { CenterSearchResponseDtoCentersItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { Avatar } from '@/ui/atoms/Avatar';
import { EmptyState } from '@/ui/molecules/EmptyState';
import { ListItem } from '@/ui/molecules/ListItem';

import { formatCenterCity } from '../model/pending-center';

interface CenterSearchResultsProps {
  centers: readonly CenterSearchResponseDtoCentersItem[];
  onCenterSelect: (center: CenterSearchResponseDtoCentersItem) => void;
  onJoinCodeRequest: () => void;
}

function describeCenterLocation(center: CenterSearchResponseDtoCentersItem): string | undefined {
  const cityName = formatCenterCity(center.city);
  if (center.distanceInKilometers === null) return cityName ?? undefined;
  const distanceText = i18n.t('join.search.distanceInKilometers', {
    distance: center.distanceInKilometers.toFixed(1).replace('.', ','),
  });
  return cityName === null ? distanceText : `${cityName} · ${distanceText}`;
}

export function CenterSearchResults({
  centers,
  onCenterSelect,
  onJoinCodeRequest,
}: Readonly<CenterSearchResultsProps>): React.JSX.Element {
  if (centers.length === 0) {
    return (
      <EmptyState
        iconName="search"
        title={i18n.t('join.search.emptyTitle')}
        description={i18n.t('join.search.emptyDescription')}
        actionLabel={i18n.t('join.search.emptyActionLabel')}
        onActionPress={onJoinCodeRequest}
      />
    );
  }
  return (
    <>
      {centers.map((center) => (
        <ListItem
          key={center.id}
          leading={<Avatar name={center.name} isDecorative />}
          title={center.name}
          subtitle={describeCenterLocation(center)}
          onPress={() => {
            onCenterSelect(center);
          }}
        />
      ))}
    </>
  );
}
