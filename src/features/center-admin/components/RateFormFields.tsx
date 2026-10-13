import { Controller, type Control } from 'react-hook-form';

import { i18n } from '@/shared/i18n';
import { FormTextField } from '@/ui/molecules/FormTextField';

import type { RateFormValues } from '../model/rate-form';
import { ServiceSelectionField } from './ServiceSelectionField';

interface RateFormFieldsProps {
  control: Control<RateFormValues>;
}

/** Clases, días de validez y precio: los tres números de un bono. */
function RateNumberFields({ control }: Readonly<RateFormFieldsProps>): React.JSX.Element {
  return (
    <>
      <FormTextField
        control={control}
        name="sessionsCount"
        label={i18n.t('centerAdmin.passes.sessionsLabel')}
        keyboardType="number-pad"
      />
      <FormTextField
        control={control}
        name="validDays"
        label={i18n.t('centerAdmin.passes.validDaysLabel')}
        helperText={i18n.t('centerAdmin.passes.validDaysHelper')}
        keyboardType="number-pad"
      />
      <FormTextField
        control={control}
        name="price"
        label={i18n.t('centerAdmin.passes.priceLabel')}
        placeholder={i18n.t('centerAdmin.passes.pricePlaceholder')}
        keyboardType="decimal-pad"
      />
    </>
  );
}

/** Nombre, clases, días de validez, precio y servicios de un bono. */
export function RateFormFields({ control }: Readonly<RateFormFieldsProps>): React.JSX.Element {
  return (
    <>
      <FormTextField
        control={control}
        name="name"
        label={i18n.t('centerAdmin.passes.nameLabel')}
        placeholder={i18n.t('centerAdmin.passes.namePlaceholder')}
      />
      <RateNumberFields control={control} />
      <Controller
        control={control}
        name="serviceIds"
        render={({ field }) => (
          <ServiceSelectionField
            title={i18n.t('centerAdmin.passes.servicesLabel')}
            helperText={i18n.t('centerAdmin.passes.servicesHelper')}
            selectedServiceIds={field.value}
            onSelectedServiceIdsChange={field.onChange}
          />
        )}
      />
    </>
  );
}
