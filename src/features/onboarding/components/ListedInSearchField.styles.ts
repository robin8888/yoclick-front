import type { ViewStyle } from 'react-native';

const FIELD_GAP = 12;

export const LISTED_FIELD_STYLE: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: FIELD_GAP,
};

export const LISTED_TEXT_STYLE: ViewStyle = { flex: 1 };
