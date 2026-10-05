import { Redirect, useRouter } from 'expo-router';
import { Share } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { JoinCodeCard } from '../components/JoinCodeCard';
import { buildCenterJoinLink } from '../model/center-join-link';
import { useCreatedCenterStore, type CreatedCenter } from '../model/created-center-store';

function shareJoinCode({ name: centerName, joinCode }: CreatedCenter): void {
  const joinLink = buildCenterJoinLink(joinCode);
  void Share.share({
    message: i18n.t('onboarding.ready.shareMessage', { centerName, joinCode, joinLink }),
  });
}

/** Prototipo `odone`: el centro ya existe; se enseña el código con el que se une la clientela. */
export function CenterReadyScreen(): React.JSX.Element {
  const router = useRouter();
  const createdCenter = useCreatedCenterStore((state) => state.createdCenter);
  const clearCreatedCenter = useCreatedCenterStore((state) => state.clearCreatedCenter);

  // Sin centro recién creado (p. ej. la app se reinició) no hay nada que enseñar aquí.
  if (createdCenter === null) return <Redirect href="/" />;
  return (
    <ScreenTemplate
      hasPlatformHeroBackground
      title={i18n.t('onboarding.ready.title', { centerName: createdCenter.name })}
      subtitle={i18n.t('onboarding.ready.subtitle')}
      isHeaderCentered
      footer={
        <>
          <Button
            variant="outline"
            leadingIconName="mail"
            label={i18n.t('onboarding.ready.shareAction')}
            isFullWidth
            onPress={() => {
              shareJoinCode(createdCenter);
            }}
          />
          <Button
            label={i18n.t('onboarding.ready.enterAction')}
            isFullWidth
            onPress={() => {
              clearCreatedCenter();
              router.replace('/');
            }}
          />
        </>
      }
    >
      <JoinCodeCard joinCode={createdCenter.joinCode} />
    </ScreenTemplate>
  );
}
