import type { Control } from 'react-hook-form';

import { FormCityField } from '@/features/address';
import { i18n } from '@/shared/i18n';
import { FormTextField } from '@/ui/molecules/FormTextField';

import type { CenterDetailsFormValues } from '../schemas/center-details.schema';
import { ListedInSearchField } from './ListedInSearchField';
import { SectorPicker } from './SectorPicker';
import { WorkModePicker } from './WorkModePicker';

interface CenterDetailsFieldsProps {
  control: Control<CenterDetailsFormValues>;
}

/** Campos del alta: nombre, cómo trabaja, tipo y ciudad. El color y el logo se ponen después, en Marca. */
export function CenterDetailsFields({
  control,
}: Readonly<CenterDetailsFieldsProps>): React.JSX.Element {
  return (
    <>
      <FormTextField
        control={control}
        name="name"
        label={i18n.t('onboarding.center.nameLabel')}
        autoCapitalize="words"
      />
      <WorkModePicker control={control} />
      <SectorPicker control={control} />
      <FormCityField control={control} name="city" label={i18n.t('onboarding.center.cityLabel')} />
      <ListedInSearchField control={control} />
    </>
  );
}
