import { useRouter } from 'expo-router';

import { describeAccessRole, useAccessCenter, type AccessCenter } from '@/features/join';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { AuthBrandHeader, useHasPlatformLook } from '../components/AuthBrandHeader';
import { RegisterAccountFooter } from '../components/RegisterAccountFooter';
import { RegisterAccountFields } from '../components/RegisterAccountFields';
import { useRegisterAccountForm } from '../hooks/useRegisterAccountForm';

// Logotipo completo en blanco, más pequeño que en el inicio para dejar sitio al formulario.
const REGISTER_LOGO_HEIGHT = 110;

function buildRegisterSubtitle(accessCenter: AccessCenter | undefined): string {
  if (accessCenter === undefined) return i18n.t('auth.register.accountSubtitle');
  const lead = i18n.t('join.invitation.registerSubtitle', {
    centerName: accessCenter.name,
    roleName: describeAccessRole(accessCenter),
  });
  if (accessCenter.emailHint === null) return lead;
  return `${lead} ${i18n.t('join.invitation.registerEmailHint', { emailHint: accessCenter.emailHint })}`;
}

/** Prototipo `reg1` con «Soy…». La foto de perfil opcional llega con APP-8 (cámara y galería). */
export function RegisterAccountScreen(): React.JSX.Element {
  const router = useRouter();
  const form = useRegisterAccountForm();
  const accessCenter = useAccessCenter();
  const hasPlatformLook = useHasPlatformLook();

  return (
    <ScreenTemplate
      title={i18n.t('auth.register.title')}
      subtitle={buildRegisterSubtitle(accessCenter)}
      isLoading={form.isSubmitting}
      loadingLabel={getSharedStateCopy().loadingLabel}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      hasPlatformHeroBackground={hasPlatformLook}
      isHeaderCentered
      headerAccessory={<AuthBrandHeader platformLogoHeight={REGISTER_LOGO_HEIGHT} />}
      footer={
        <RegisterAccountFooter
          isLastStep={form.isLastStep}
          isSubmitting={form.isSubmitting}
          onSubmit={form.submitAccount}
        />
      }
    >
      {form.errorMessage === null ? null : <FormErrorBanner message={form.errorMessage} />}
      <RegisterAccountFields control={form.control} hasInvitation={accessCenter !== undefined} />
    </ScreenTemplate>
  );
}
