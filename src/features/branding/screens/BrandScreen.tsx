import { useActiveCenterSummary } from '@/features/auth';
import { LoadErrorState, useActiveCenterSectorId } from '@/features/join';
import { usePickCenterLogo } from '@/features/onboarding';
import { resolveApiAssetUrl } from '@/shared/api/asset-url';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { BrandEditor } from '../components/BrandEditor';
import { PublishBrandButton } from '../components/PublishBrandButton';
import { useBrandDraft } from '../hooks/useBrandDraft';
import { usePublishBrand } from '../hooks/usePublishBrand';

/** Prototipo `abrand`: logo, color y nombre con vista previa en vivo y «Publicar cambios». */
export function BrandScreen(): React.JSX.Element {
  const brand = useBrandDraft();
  const logoPicker = usePickCenterLogo();
  const publication = usePublishBrand();
  const center = useActiveCenterSummary();
  const clientWord = getSectorVocabulary(useActiveCenterSectorId()).client.plural;

  return (
    <ScreenTemplate
      title={i18n.t('branding.title')}
      subtitle={i18n.t('branding.subtitle', { clientWord })}
      isLoading={publication.isPublishing || logoPicker.isPreparing}
      footer={
        <PublishBrandButton
          brand={brand}
          pickedLogo={logoPicker.pickedLogo}
          publication={publication}
        />
      }
    >
      {brand.isLoading ? <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} /> : null}
      {brand.hasFailed ? (
        <LoadErrorState
          title={i18n.t('branding.errorTitle')}
          error={brand.error}
          onRetry={brand.retry}
        />
      ) : null}
      {brand.draft === null ? null : (
        <BrandEditor
          brand={brand}
          draft={brand.draft}
          logoPicker={logoPicker}
          publication={publication}
          currentLogoUrl={resolveApiAssetUrl(center.logoUrl)}
        />
      )}
    </ScreenTemplate>
  );
}
