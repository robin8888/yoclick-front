import { useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';

import { CameraPermissionPrompt, JoinScanCamera } from '@/features/join';
import { i18n } from '@/shared/i18n';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { CheckInResultCard } from '../components/CheckInResultCard';
import { useCheckInScanner } from '../hooks/useCheckInScanner';

/** Prototipo `Escanear QR de asistencia`: la cámara solo se enciende aquí y no se guarda nada. */
export function ScanAttendanceScreen(): React.JSX.Element {
  const router = useRouter();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const scanner = useCheckInScanner();

  return (
    <ScreenTemplate
      title={i18n.t('attendance.scan.title')}
      subtitle={i18n.t('attendance.scan.subtitle')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      isLoading={scanner.isRegistering}
    >
      {scanner.problemMessage === null ? null : (
        <FormErrorBanner message={scanner.problemMessage} />
      )}
      {scanner.scannedCheckIn === null ? (
        <ScanCameraOrPermission
          isGranted={cameraPermission?.granted === true}
          canAskAgain={cameraPermission?.canAskAgain !== false}
          isPaused={scanner.isRegistering}
          onQrScan={scanner.handleQrScanned}
          onRequestPermission={() => {
            void requestCameraPermission();
          }}
        />
      ) : (
        <CheckInResultCard checkIn={scanner.scannedCheckIn} onScanAnother={scanner.scanAnother} />
      )}
    </ScreenTemplate>
  );
}

interface ScanCameraOrPermissionProps {
  isGranted: boolean;
  canAskAgain: boolean;
  isPaused: boolean;
  onQrScan: (qrContent: string) => void;
  onRequestPermission: () => void;
}

function ScanCameraOrPermission({
  isGranted,
  canAskAgain,
  isPaused,
  onQrScan,
  onRequestPermission,
}: Readonly<ScanCameraOrPermissionProps>): React.JSX.Element {
  if (isGranted) return <JoinScanCamera isPaused={isPaused} onQrScan={onQrScan} />;
  return (
    <CameraPermissionPrompt canAskAgain={canAskAgain} onRequestPermission={onRequestPermission} />
  );
}
