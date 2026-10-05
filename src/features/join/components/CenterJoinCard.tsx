import { resolveApiAssetUrl } from '@/shared/api/asset-url';
import { i18n } from '@/shared/i18n';
import { Avatar } from '@/ui/atoms/Avatar';
import { Text } from '@/ui/atoms/Text';

import type { PendingCenter } from '../model/pending-center';

interface CenterJoinCardProps {
  centerToJoin: PendingCenter;
}

/** El centro que se va a unir: su logo, su nombre y qué verá de la persona. */
export function CenterJoinCard({ centerToJoin }: Readonly<CenterJoinCardProps>): React.JSX.Element {
  return (
    <>
      <Avatar
        name={centerToJoin.name}
        photoUrl={resolveApiAssetUrl(centerToJoin.logoUrl)}
        size="xl"
        isDecorative
      />
      <Text variant="titleMd">{centerToJoin.name}</Text>
      <Text color="ink2">
        {i18n.t('join.confirm.privacyNote', { centerName: centerToJoin.name })}
      </Text>
    </>
  );
}
