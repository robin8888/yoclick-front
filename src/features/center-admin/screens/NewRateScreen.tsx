import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { RateFormFields } from '../components/RateFormFields';
import { useCreateRate } from '../hooks/useCreateRate';
import {
  buildEmptyRateForm,
  mapRateFormToCreateRequest,
  rateFormSchema,
  type RateFormValues,
} from '../model/rate-form';

/** «Nuevo bono»: nombre, clases, días de validez, precio y los servicios en los que vale. */
export function NewRateScreen(): React.JSX.Element {
  const router = useRouter();
  const { control, handleSubmit } = useForm<RateFormValues>({
    resolver: zodResolver(rateFormSchema),
    defaultValues: buildEmptyRateForm(),
  });
  const creation = useCreateRate(router.back);

  return (
    <ScreenTemplate
      title={i18n.t('centerAdmin.passes.newTitle')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      isLoading={creation.isCreating}
      footer={
        <Button
          isFullWidth
          label={i18n.t('centerAdmin.passes.saveAction')}
          onPress={() => {
            void handleSubmit((formValues) => {
              creation.createRate(mapRateFormToCreateRequest(formValues));
            })();
          }}
        />
      }
    >
      <RateFormFields control={control} />
      {creation.errorMessage === null ? null : <FormErrorBanner message={creation.errorMessage} />}
    </ScreenTemplate>
  );
}
