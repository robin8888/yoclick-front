import type { Control, UseFormSetValue } from 'react-hook-form';

import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';
import { FormTextField } from '@/ui/molecules/FormTextField';

import type { CenterDetailsFormValues } from '../schemas/center-details.schema';
import { BrandColorPicker } from './BrandColorPicker';
import { CenterBrandPreview } from './CenterBrandPreview';
import { ListedInSearchField } from './ListedInSearchField';
import { SectorPicker } from './SectorPicker';

const FALLBACK_PREVIEW_NAME = 'Tu centro';

interface CenterDetailsFieldsProps {
  control: Control<CenterDetailsFormValues>;
  setValue: UseFormSetValue<CenterDetailsFormValues>;
  centerName: string;
  brandColor: string;
}

/** Campos del alta: nombre, tipo, ciudad y marca con una vista previa en vivo. */
export function CenterDetailsFields({
  control,
  setValue,
  centerName,
  brandColor,
}: Readonly<CenterDetailsFieldsProps>): React.JSX.Element {
  const previewName = centerName.trim() === '' ? FALLBACK_PREVIEW_NAME : centerName;

  return (
    <>
      <FormTextField
        control={control}
        name="name"
        label={i18n.t('onboarding.center.nameLabel')}
        autoCapitalize="words"
      />
      <SectorPicker control={control} />
      <FormTextField
        control={control}
        name="city"
        label={i18n.t('onboarding.center.cityLabel')}
        autoCapitalize="words"
      />
      <ListedInSearchField control={control} />
      <BrandColorPicker
        selectedColor={brandColor}
        onColorSelect={(hexColor) => {
          setValue('brandColor', hexColor);
        }}
      />
      <Text variant="bodyStrong">{i18n.t('onboarding.center.previewLabel')}</Text>
      <CenterBrandPreview centerName={previewName} brandHexColor={brandColor} />
    </>
  );
}
