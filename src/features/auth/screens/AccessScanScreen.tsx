import { useRouter } from 'expo-router';

import { ScanCameraArea, useJoinQrScanner } from '@/features/join';
import { getApiErrorMessage } from '@/shared/api/errors';
import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { AuthBrandHeader } from '../components/AuthBrandHeader';

const SCAN_LOGO_HEIGHT = 110;

/**
 * Escanear el QR del centro («Invita a tus alumnos») sin tener cuenta: es lo mismo que escribir el
 * código del centro. La app se viste con su marca y sigue al registro como alumno.
 */
export function AccessScanScreen(): React.JSX.Element {
  const router = useRouter();
  const scanner = useJoinQrScanner(() => {
    router.replace('/(auth)/register');
  });
  const problem = scanner.scanProblem;

  return (
    <ScreenTemplate
      title={i18n.t('join.invitation.scanScreenTitle')}
      subtitle={i18n.t('join.invitation.scanScreenSubtitle')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      hasPlatformHeroBackground
      isHeaderCentered
      headerAccessory={<AuthBrandHeader platformLogoHeight={SCAN_LOGO_HEIGHT} />}
    >
      {problem === null ? null : (
        <FormErrorBanner
          message={
            problem.kind === 'unrecognized'
              ? i18n.t('join.scan.unrecognized')
              : getApiErrorMessage(problem.error)
          }
        />
      )}
      <ScanCameraArea isPaused={scanner.isLookingUpCenter} onQrScan={scanner.handleQrScanned} />
      <Button
        variant="ghost"
        isFullWidth
        label={i18n.t('join.invitation.haveCodeAction')}
        onPress={() => {
          router.replace('/(auth)/code');
        }}
      />
    </ScreenTemplate>
  );
}
