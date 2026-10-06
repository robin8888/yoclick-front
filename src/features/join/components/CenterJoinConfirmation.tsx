import { useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { CenterJoinCard } from './CenterJoinCard';
import { useCenterJoinConfirmation } from '../hooks/useCenterJoinConfirmation';
import type { PendingCenter } from '../model/pending-center';
import { getJoinCenterErrorMessage } from '../screens/join-error-messages';

interface CenterJoinConfirmationProps {
  centerToJoin: PendingCenter;
}

export function CenterJoinConfirmation({
  centerToJoin,
}: Readonly<CenterJoinConfirmationProps>): React.JSX.Element {
  const router = useRouter();
  const { confirmJoin, isJoining, joinError } = useCenterJoinConfirmation(centerToJoin);

  return (
    <ScreenTemplate
      title={i18n.t('join.confirm.title')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      isLoading={isJoining}
      footer={
        <>
          <Button
            label={i18n.t('join.confirm.joinAction', { centerName: centerToJoin.name })}
            isFullWidth
            isLoading={isJoining}
            onPress={confirmJoin}
          />
          <Button
            variant="ghost"
            label={i18n.t('join.confirm.notMyCenterAction')}
            isFullWidth
            onPress={router.back}
          />
        </>
      }
    >
      {joinError === null ? null : (
        <FormErrorBanner message={getJoinCenterErrorMessage(joinError)} />
      )}
      <CenterJoinCard centerToJoin={centerToJoin} />
    </ScreenTemplate>
  );
}
