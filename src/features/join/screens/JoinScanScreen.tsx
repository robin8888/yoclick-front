import { useRouter } from 'expo-router';

import { getApiErrorMessage } from '@/shared/api/errors';
import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Logo } from '@/ui/atoms/Logo';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';
import { SignOutAction } from '@/features/session';
import { useSignOutFlow } from '@/shared/auth/useSignOutFlow';

import { ScanCameraArea } from '../components/ScanCameraArea';
import { useJoinQrScanner, type JoinQrScanProblem } from '../hooks/useJoinQrScanner';

function getScanProblemMessage(scanProblem: JoinQrScanProblem): string {
  return scanProblem.kind === 'unrecognized'
    ? i18n.t('join.scan.unrecognized')
    : getApiErrorMessage(scanProblem.error);
}

// Logotipo completo en blanco, del mismo tamaño que en el inicio de sesión y el registro.
const SCAN_LOGO_HEIGHT = 110;

/** Prototipo `jqr`. La cámara solo se enciende en esta pantalla y no se guarda nada. */
export function JoinScanScreen(): React.JSX.Element {
  const signOut = useSignOutFlow();
  const router = useRouter();
  const { handleQrScanned, scanProblem, isLookingUpCenter } = useJoinQrScanner();

  return (
    <ScreenTemplate
      isLoading={signOut.isSigningOut}
      title={i18n.t('join.scan.title')}
      subtitle={i18n.t('join.scan.subtitle')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      hasPlatformHeroBackground
      isHeaderCentered
      headerAccessory={<Logo variant="lockup" height={SCAN_LOGO_HEIGHT} />}
    >
      {scanProblem === null ? null : (
        <FormErrorBanner message={getScanProblemMessage(scanProblem)} />
      )}
      <ScanCameraArea isPaused={isLookingUpCenter} onQrScan={handleQrScanned} />
      <Button
        variant="ghost"
        isFullWidth
        label={i18n.t('join.scan.useCodeInsteadAction')}
        onPress={() => {
          router.replace('/join/code');
        }}
      />
      <SignOutAction flow={signOut} />
    </ScreenTemplate>
  );
}
