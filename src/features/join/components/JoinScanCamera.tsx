import { CameraView } from 'expo-camera';
import { View } from 'react-native';

import { useTheme } from '@/shared/theme';

import { CAMERA_FILL_STYLE, createCameraFrameStyle } from './JoinScanCamera.styles';

interface JoinScanCameraProps {
  /** Mientras se busca el centro se deja de escuchar la cámara. */
  isPaused: boolean;
  onQrScan: (qrContent: string) => void;
}

export function JoinScanCamera({
  isPaused,
  onQrScan,
}: Readonly<JoinScanCameraProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createCameraFrameStyle(theme)}>
      <CameraView
        style={CAMERA_FILL_STYLE}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={
          isPaused
            ? undefined
            : (scanResult) => {
                onQrScan(scanResult.data);
              }
        }
      />
    </View>
  );
}
