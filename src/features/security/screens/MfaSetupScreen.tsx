import { useState } from 'react';

import type { MfaSetupResponseDto } from '@/shared/api/generated/model';

import { MfaPasswordStep } from '../components/MfaPasswordStep';
import { MfaRecoveryStep } from '../components/MfaRecoveryStep';
import { MfaScanStep } from '../components/MfaScanStep';

type EnrollmentStep =
  | { kind: 'password' }
  | { kind: 'scan'; setup: MfaSetupResponseDto }
  | { kind: 'recovery'; recoveryCodes: string[] };

/** Activar la verificación en dos pasos: contraseña, QR con el primer código y códigos de recuperación. */
export function MfaSetupScreen(): React.JSX.Element {
  const [step, setStep] = useState<EnrollmentStep>({ kind: 'password' });

  if (step.kind === 'password') {
    return (
      <MfaPasswordStep
        onSetupStarted={(setup) => {
          setStep({ kind: 'scan', setup });
        }}
      />
    );
  }
  if (step.kind === 'scan') {
    return (
      <MfaScanStep
        setup={step.setup}
        onActivated={(recoveryCodes) => {
          setStep({ kind: 'recovery', recoveryCodes });
        }}
      />
    );
  }
  return <MfaRecoveryStep recoveryCodes={step.recoveryCodes} />;
}
