import { useState } from 'react';

import { MfaScreenLogo } from '@/features/auth';
import { SignOutAction } from '@/features/session';
import { useSignOutFlow } from '@/shared/auth/useSignOutFlow';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Button } from '@/ui/atoms/Button';
import { OptionCard } from '@/ui/molecules/OptionCard';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import type { MfaEnrollmentMethod } from '../hooks/useMfaPasswordStep';

interface MfaMethodStepProps {
  onMethodChosen: (method: MfaEnrollmentMethod) => void;
}

interface MfaMethodOptionsProps {
  method: MfaEnrollmentMethod;
  onMethodChange: (method: MfaEnrollmentMethod) => void;
}

function MfaMethodOptions({
  method,
  onMethodChange,
}: Readonly<MfaMethodOptionsProps>): React.JSX.Element {
  return (
    <>
      <OptionCard
        title={i18n.t('security.mfaSetup.methodAppTitle')}
        description={i18n.t('security.mfaSetup.methodAppDescription')}
        isSelected={method === 'totp'}
        onPress={() => {
          onMethodChange('totp');
        }}
      />
      <OptionCard
        title={i18n.t('security.mfaSetup.methodEmailTitle')}
        description={i18n.t('security.mfaSetup.methodEmailDescription')}
        isSelected={method === 'email'}
        onPress={() => {
          onMethodChange('email');
        }}
      />
    </>
  );
}

/** Paso 1: elegir cómo se recibirá el código: app de autenticación (más segura) o correo. */
export function MfaMethodStep({ onMethodChosen }: Readonly<MfaMethodStepProps>): React.JSX.Element {
  const [method, setMethod] = useState<MfaEnrollmentMethod>('totp');
  const signOut = useSignOutFlow();

  return (
    <ScreenTemplate
      hasPlatformHeroBackground
      isHeaderCentered
      isLoading={signOut.isSigningOut}
      loadingLabel={getSharedStateCopy().loadingLabel}
      headerAccessory={<MfaScreenLogo />}
      title={i18n.t('security.mfaSetup.methodTitle')}
      subtitle={i18n.t('security.mfaSetup.methodSubtitle')}
      footer={
        <Button
          label={i18n.t('security.mfaSetup.continueLabel')}
          isFullWidth
          onPress={() => {
            onMethodChosen(method);
          }}
        />
      }
    >
      <MfaMethodOptions method={method} onMethodChange={setMethod} />
      <SignOutAction flow={signOut} />
    </ScreenTemplate>
  );
}
