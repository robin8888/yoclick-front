import { useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Logo } from '@/ui/atoms/Logo';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { RegisterAccountFooter } from '../components/RegisterAccountFooter';
import { RegisterAccountFields } from '../components/RegisterAccountFields';
import { useRegisterAccountForm } from '../hooks/useRegisterAccountForm';

// Logotipo completo en blanco, más pequeño que en el inicio para dejar sitio al formulario.
const REGISTER_LOGO_HEIGHT = 110;

/** Prototipo `reg1` con «Soy…». La foto de perfil opcional llega con APP-8 (cámara y galería). */
export function RegisterAccountScreen(): React.JSX.Element {
  const router = useRouter();
  const form = useRegisterAccountForm();

  return (
    <ScreenTemplate
      title={i18n.t('auth.register.title')}
      subtitle={i18n.t('auth.register.accountSubtitle')}
      isLoading={form.isSubmitting}
      loadingLabel={getSharedStateCopy().loadingLabel}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      hasPlatformHeroBackground
      isHeaderCentered
      headerAccessory={<Logo variant="lockup" height={REGISTER_LOGO_HEIGHT} />}
      footer={
        <RegisterAccountFooter
          isLastStep={form.isLastStep}
          isSubmitting={form.isSubmitting}
          onSubmit={form.submitAccount}
        />
      }
    >
      {form.errorMessage === null ? null : <FormErrorBanner message={form.errorMessage} />}
      <RegisterAccountFields control={form.control} />
    </ScreenTemplate>
  );
}
