import { Redirect, useRouter } from 'expo-router';

import { useSessionStore } from '@/shared/auth/session-store';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Button } from '@/ui/atoms/Button';
import { Logo } from '@/ui/atoms/Logo';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';
import { SignOutAction } from '@/features/session';
import { useSignOutFlow } from '@/shared/auth/useSignOutFlow';

import { CenterDetailsFields } from '../components/CenterDetailsFields';
import { useCreateCenterForm } from '../hooks/useCreateCenterForm';

// Logotipo completo en blanco, del mismo tamaño que en el inicio de sesión y el registro.
const CREATE_CENTER_LOGO_HEIGHT = 110;

interface CreateCenterFooterProps {
  isSubmitting: boolean;
  onSubmit: () => void;
}

function CreateCenterFooter({
  isSubmitting,
  onSubmit,
}: Readonly<CreateCenterFooterProps>): React.JSX.Element {
  return (
    <>
      <Text variant="caption" color="ink2" align="center">
        {i18n.t('onboarding.center.trialNotice')}
      </Text>
      <Button
        label={i18n.t('onboarding.center.submitLabel')}
        isFullWidth
        isLoading={isSubmitting}
        onPress={onSubmit}
      />
    </>
  );
}

/** Prototipo `o1` + color de `o2`: el logo llega cuando la API admita subir ficheros. */
export function CreateCenterScreen(): React.JSX.Element {
  const signOut = useSignOutFlow();
  const router = useRouter();
  const isSignedOut = useSessionStore((state) => state.status === 'signedOut');
  const form = useCreateCenterForm();

  if (isSignedOut) return <Redirect href="/(auth)/register" />;
  return (
    <ScreenTemplate
      hasPlatformHeroBackground
      isHeaderCentered
      headerAccessory={<Logo variant="lockup" height={CREATE_CENTER_LOGO_HEIGHT} />}
      isLoading={form.isSubmitting || signOut.isSigningOut}
      loadingLabel={getSharedStateCopy().loadingLabel}
      title={i18n.t('onboarding.center.title')}
      subtitle={i18n.t('onboarding.center.subtitle')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      footer={<CreateCenterFooter isSubmitting={form.isSubmitting} onSubmit={form.submitCenter} />}
    >
      {form.errorMessage === null ? null : <FormErrorBanner message={form.errorMessage} />}
      <CenterDetailsFields
        control={form.control}
        setValue={form.setValue}
        centerName={form.watchedName}
        brandColor={form.watchedBrandColor}
      />
      <SignOutAction flow={signOut} />
    </ScreenTemplate>
  );
}
