import type { Control } from 'react-hook-form';

import { i18n } from '@/shared/i18n';
import { FormConsentCheckbox } from '@/ui/molecules/FormConsentCheckbox';

import type { RegisterAccountFormValues } from '../schemas/auth-forms.schema';

interface RegistrationConsentsProps {
  control: Control<RegisterAccountFormValues>;
}

/** Tres consentimientos independientes y desmarcados; solo los dos primeros son obligatorios. */
export function RegistrationConsents({
  control,
}: Readonly<RegistrationConsentsProps>): React.JSX.Element {
  return (
    <>
      <FormConsentCheckbox
        control={control}
        name="isPrivacyAccepted"
        label={i18n.t('auth.register.privacyConsent')}
      />
      <FormConsentCheckbox
        control={control}
        name="isTermsAccepted"
        label={i18n.t('auth.register.termsConsent')}
      />
      <FormConsentCheckbox
        control={control}
        name="isMarketingAccepted"
        label={i18n.t('auth.register.marketingConsent')}
      />
    </>
  );
}
