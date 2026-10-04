import { useRouter } from 'expo-router';

import type { MyMembershipsResponseDtoMembershipsItem } from '@/shared/api/generated/model';
import { useSessionStore } from '@/shared/auth/session-store';
import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { useSwitchActiveCenter } from '../hooks/useSwitchActiveCenter';
import { MyCentersList } from './MyCentersList';

interface MyCentersOverviewProps {
  memberships: readonly MyMembershipsResponseDtoMembershipsItem[];
}

export function MyCentersOverview({
  memberships,
}: Readonly<MyCentersOverviewProps>): React.JSX.Element {
  const router = useRouter();
  const activeCenterId = useSessionStore((state) => state.activeCenterId);
  const switchActiveCenter = useSwitchActiveCenter();

  function goToJoinFlow(): void {
    router.push('/join');
  }

  return (
    <ScreenTemplate
      title={i18n.t('join.centers.title')}
      subtitle={i18n.t('join.centers.subtitle')}
      footer={
        <Button
          variant="outline"
          leadingIconName="plus"
          label={i18n.t('join.centers.joinAnotherAction')}
          isFullWidth
          onPress={goToJoinFlow}
        />
      }
    >
      <MyCentersList
        memberships={memberships}
        activeCenterId={activeCenterId}
        onCenterSelect={switchActiveCenter}
        onJoinCenterRequest={goToJoinFlow}
      />
      <Text variant="caption" color="ink2">
        {i18n.t('join.centers.privacyNote')}
      </Text>
    </ScreenTemplate>
  );
}
