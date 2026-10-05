import type { ViewStyle } from 'react-native';

import { platformCardColors } from '@/shared/theme';

const CODES_GAP = 10;
const CODE_CARD_RADIUS = 12;
const CODE_CARD_VERTICAL_PADDING = 10;
const CODE_CARD_HORIZONTAL_PADDING = 14;
const CODE_CARD_MIN_WIDTH = 140;

export const RECOVERY_CODES_STYLE: ViewStyle = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: CODES_GAP,
};

export const RECOVERY_CODE_CARD_STYLE: ViewStyle = {
  minWidth: CODE_CARD_MIN_WIDTH,
  alignItems: 'center',
  paddingVertical: CODE_CARD_VERTICAL_PADDING,
  paddingHorizontal: CODE_CARD_HORIZONTAL_PADDING,
  borderRadius: CODE_CARD_RADIUS,
  backgroundColor: platformCardColors.surface,
};
