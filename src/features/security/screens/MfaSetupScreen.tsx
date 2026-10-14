import { useState } from 'react';

import type { MfaSetupResponseDto } from '@/shared/api/generated/model';

import { MfaEmailCodeStep } from '../components/MfaEmailCodeStep';
import { MfaMethodStep } from '../components/MfaMethodStep';
import { MfaPasswordStep } from '../components/MfaPasswordStep';
import { MfaRecoveryStep } from '../components/MfaRecoveryStep';
import { MfaScanStep } from '../components/MfaScanStep';
import type { MfaEnrollmentMethod } from '../hooks/useMfaPasswordStep';

type EnrollmentStep =
  | { kind: 'method' }
  | { kind: 'password'; method: MfaEnrollmentMethod }
  | { kind: 'scan'; setup: MfaSetupResponseDto }
  | { kind: 'emailCode'; emailHint: string }
  | { kind: 'recovery'; recoveryCodes: string[] };

interface StepProps {
  step: EnrollmentStep;
  onStepChange: (step: EnrollmentStep) => void;
}

/** Los dos primeros pasos: qué método y la contraseña (que arranca la app o envía el correo). */
function StartSteps({ step, onStepChange }: Readonly<StepProps>): React.JSX.Element | null {
  if (step.kind === 'method') {
    return (
      <MfaMethodStep
        onMethodChosen={(method) => {
          onStepChange({ kind: 'password', method });
        }}
      />
    );
  }
  if (step.kind !== 'password') return null;
  return (
    <MfaPasswordStep
      method={step.method}
      onTotpSetupStarted={(setup) => {
        onStepChange({ kind: 'scan', setup });
      }}
      onEmailCodeSent={({ emailHint }) => {
        onStepChange({ kind: 'emailCode', emailHint });
      }}
    />
  );
}

/** El primer código (QR de la app o el del correo) y los códigos de recuperación. */
function ActivationSteps({ step, onStepChange }: Readonly<StepProps>): React.JSX.Element | null {
  const showRecovery = (recoveryCodes: string[]): void => {
    onStepChange({ kind: 'recovery', recoveryCodes });
  };
  if (step.kind === 'scan') return <MfaScanStep setup={step.setup} onActivated={showRecovery} />;
  if (step.kind === 'recovery') return <MfaRecoveryStep recoveryCodes={step.recoveryCodes} />;
  if (step.kind !== 'emailCode') return null;
  return (
    <MfaEmailCodeStep
      emailHint={step.emailHint}
      onActivated={showRecovery}
      onRequestNewCode={() => {
        onStepChange({ kind: 'password', method: 'email' });
      }}
    />
  );
}

/**
 * Activar la verificación en dos pasos: elegir método (app o correo), contraseña, el primer código
 * (QR de la app o el que llega al correo) y los códigos de recuperación.
 */
export function MfaSetupScreen(): React.JSX.Element {
  const [step, setStep] = useState<EnrollmentStep>({ kind: 'method' });

  return (
    <>
      <StartSteps step={step} onStepChange={setStep} />
      <ActivationSteps step={step} onStepChange={setStep} />
    </>
  );
}
