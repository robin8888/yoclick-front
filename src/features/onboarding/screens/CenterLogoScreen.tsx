import { Redirect, useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { CenterLogoActions } from '../components/CenterLogoActions';
import { CenterLogoPreview } from '../components/CenterLogoPreview';
import { useCenterLogoFlow } from '../hooks/useCenterLogoFlow';
import { useCreatedCenterStore, type CreatedCenter } from '../model/created-center-store';

interface CenterLogoContentProps {
  createdCenter: CreatedCenter;
}

function CenterLogoContent({ createdCenter }: Readonly<CenterLogoContentProps>): React.JSX.Element {
  const router = useRouter();
  const flow = useCenterLogoFlow(createdCenter);

  return (
    <ScreenTemplate
      hasPlatformHeroBackground
      isHeaderCentered
      isLoading={flow.isBusy}
      loadingLabel={getSharedStateCopy().loadingLabel}
      title={i18n.t('onboarding.logo.title')}
      subtitle={i18n.t('onboarding.logo.subtitle')}
      footer={
        <CenterLogoActions
          hasPickedLogo={flow.pickedLogo !== null}
          isBusy={flow.isBusy}
          onLogoPick={flow.pickLogo}
          onLogoUpload={flow.uploadPickedLogo}
          onSkip={() => {
            router.replace('/(onboarding)/done');
          }}
        />
      }
    >
      {flow.problemMessage === null ? null : <FormErrorBanner message={flow.problemMessage} />}
      <CenterLogoPreview
        centerName={createdCenter.name}
        brandHexColor={createdCenter.brandColor}
        logoUri={flow.pickedLogo?.previewUri ?? null}
        accessibilityLabel={i18n.t('onboarding.logo.previewLabel', {
          centerName: createdCenter.name,
        })}
      />
    </ScreenTemplate>
  );
}

/** Prototipo `o2`: el propietario sube el logo de su centro justo después de crearlo. */
export function CenterLogoScreen(): React.JSX.Element {
  const createdCenter = useCreatedCenterStore((state) => state.createdCenter);

  // Sin centro recién creado (p. ej. la app se reinició) no hay logo que subir aquí.
  if (createdCenter === null) return <Redirect href="/" />;
  return <CenterLogoContent createdCenter={createdCenter} />;
}
