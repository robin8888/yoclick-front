import type { ViewStyle } from 'react-native';

import { platformCardColors } from '@/shared/theme';

const PREVIEW_GAP = 12;
const PREVIEW_PADDING = 24;
const PREVIEW_RADIUS = 20;
const PILL_RADIUS = 999;
const PILL_VERTICAL_PADDING = 6;
const PILL_HORIZONTAL_PADDING = 14;

export const INVITATION_PREVIEW_STYLE: ViewStyle = {
  alignItems: 'center',
  gap: PREVIEW_GAP,
  padding: PREVIEW_PADDING,
  borderRadius: PREVIEW_RADIUS,
  backgroundColor: platformCardColors.surface,
};

export const INVITATION_ROLE_PILL_STYLE: ViewStyle = {
  paddingVertical: PILL_VERTICAL_PADDING,
  paddingHorizontal: PILL_HORIZONTAL_PADDING,
  borderRadius: PILL_RADIUS,
  backgroundColor: platformCardColors.iconTile,
};
