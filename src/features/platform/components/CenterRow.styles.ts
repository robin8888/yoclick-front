import type { ViewStyle } from 'react-native';

const BADGES_GAP = 6;
const PRESSED_OPACITY = 0.85;

/** Avatar y nombre: el nombre ocupa el resto y se parte en líneas si es largo. */
export const IDENTITY_STYLE: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
};

export const BADGES_STYLE: ViewStyle = { flexDirection: 'row', flexWrap: 'wrap', gap: BADGES_GAP };

export const PRESSED_STYLE: ViewStyle = { opacity: PRESSED_OPACITY };
