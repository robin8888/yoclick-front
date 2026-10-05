import type { MyMembershipsResponseDtoMembershipsItem } from '@/shared/api/generated/model';
import { resolveApiAssetUrl } from '@/shared/api/asset-url';
import { i18n } from '@/shared/i18n';
import { Avatar } from '@/ui/atoms/Avatar';
import { ListItem } from '@/ui/molecules/ListItem';

interface MyCenterRowProps {
  membership: MyMembershipsResponseDtoMembershipsItem;
  isActiveCenter: boolean;
  onPress: () => void;
}

export function MyCenterRow({
  membership,
  isActiveCenter,
  onPress,
}: Readonly<MyCenterRowProps>): React.JSX.Element {
  return (
    <ListItem
      leading={
        <Avatar
          name={membership.center.name}
          photoUrl={resolveApiAssetUrl(membership.center.logoUrl)}
          isDecorative
        />
      }
      title={membership.center.name}
      subtitle={isActiveCenter ? i18n.t('join.centers.currentCenter') : undefined}
      isSelected={isActiveCenter}
      onPress={onPress}
    />
  );
}
