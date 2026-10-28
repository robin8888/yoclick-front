import type { Control } from 'react-hook-form';

import { i18n } from '@/shared/i18n';
import { useLegalLinks } from '@/shared/legal/useLegalLinks';
import { FormConsentCheckbox } from '@/ui/molecules/FormConsentCheckbox';
import { LegalLinks } from '@/ui/molecules/LegalLinks';

import type { RegisterAccountFormValues } from '../schemas/auth-forms.schema';

interface RegistrationConsentsProps {
  control: Control<RegisterAccountFormValues>;
}

/**
 * Tres consentimientos independientes y desmarcados; solo los dos primeros son obligatorios. Encima, los
 * enlaces a la política de privacidad y a las condiciones, para poder leerlas antes de aceptarlas (Apple 5.1.1(i)).
 */
export function RegistrationConsents({
  control,
}: Readonly<RegistrationConsentsProps>): React.JSX.Element {
  const legal = useLegalLinks();

  return (
    <>
      <LegalLinks
        links={legal.links}
        errorMessage={legal.hasOpenFailed ? i18n.t('legal.openFailed') : undefined}
      />
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
