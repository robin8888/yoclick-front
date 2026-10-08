import { useCameraPermissions } from 'expo-camera';

import { CameraPermissionPrompt } from './CameraPermissionPrompt';
import { JoinScanCamera } from './JoinScanCamera';

interface ScanCameraAreaProps {
  isPaused: boolean;
  onQrScan: (scannedText: string) => void;
}

/** La cámara cuando hay permiso y, si no, la petición del permiso. */
export function ScanCameraArea({
  isPaused,
  onQrScan,
}: Readonly<ScanCameraAreaProps>): React.JSX.Element {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  if (cameraPermission?.granted === true) {
    return <JoinScanCamera isPaused={isPaused} onQrScan={onQrScan} />;
  }
  return (
    <CameraPermissionPrompt
      canAskAgain={cameraPermission?.canAskAgain !== false}
      onRequestPermission={() => {
        void requestCameraPermission();
      }}
    />
  );
}
