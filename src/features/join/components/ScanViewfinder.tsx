import { View } from 'react-native';

import { createViewfinderCornerStyle, VIEWFINDER_OVERLAY_STYLE } from './ScanViewfinder.styles';

const CORNERS = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'] as const;

/** Cuatro esquinas doradas sobre la cámara: enmarcan dónde poner el QR. Son solo decoración. */
export function ScanViewfinder(): React.JSX.Element {
  return (
    <View
      pointerEvents="none"
      aria-hidden
      importantForAccessibility="no-hide-descendants"
      style={VIEWFINDER_OVERLAY_STYLE}
    >
      {CORNERS.map((corner) => (
        <View key={corner} style={createViewfinderCornerStyle(corner)} />
      ))}
    </View>
  );
}
