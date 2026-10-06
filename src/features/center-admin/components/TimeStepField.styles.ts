import type { ViewStyle } from 'react-native';

const TIME_VALUE_MIN_WIDTH = 52;

export const TIME_FIELD_STYLE: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
};

export const TIME_VALUE_STYLE: ViewStyle = { minWidth: TIME_VALUE_MIN_WIDTH };
