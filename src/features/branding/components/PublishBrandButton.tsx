import type { PickedLogo } from '@/features/onboarding';
import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';

import type { BrandDraftState } from '../hooks/useBrandDraft';
import type { PublishBrand } from '../hooks/usePublishBrand';

interface PublishBrandButtonProps {
  brand: BrandDraftState;
  pickedLogo: PickedLogo | null;
  publication: PublishBrand;
}

/** «Publicar cambios»: solo se activa con algo que publicar y un borrador sin errores. */
export function PublishBrandButton({
  brand,
  pickedLogo,
  publication,
}: Readonly<PublishBrandButtonProps>): React.JSX.Element {
  const hasChanges = brand.patch !== null || pickedLogo !== null;
  const canPublish = hasChanges && brand.problems.length === 0 && brand.settingsVersion !== null;

  return (
    <Button
      label={i18n.t('branding.publishAction')}
      isFullWidth
      isDisabled={!canPublish}
      onPress={() => {
        if (brand.settingsVersion === null) return;
        publication.publish({
          patch: brand.patch,
          newLogo: pickedLogo,
          settingsVersion: brand.settingsVersion,
        });
      }}
    />
  );
}
