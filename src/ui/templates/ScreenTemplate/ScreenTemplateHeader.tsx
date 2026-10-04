import { View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { IconButton } from '@/ui/atoms/IconButton';
import { Text } from '@/ui/atoms/Text';

import { createHeaderAccessoryStyle, createHeaderStyle } from './ScreenTemplate.styles';
import type { ScreenTemplateProps } from './ScreenTemplate.types';

type ScreenTemplateHeaderProps = Pick<
  ScreenTemplateProps,
  'title' | 'subtitle' | 'onBackPress' | 'backLabel' | 'headerAccessory' | 'isHeaderCentered'
>;

export function ScreenTemplateHeader({
  title,
  subtitle,
  onBackPress,
  backLabel,
  headerAccessory,
  isHeaderCentered = false,
}: Readonly<ScreenTemplateHeaderProps>): React.JSX.Element {
  const theme = useTheme();
  const textAlign = isHeaderCentered ? 'center' : 'left';

  return (
    <>
      {onBackPress === undefined ? null : (
        <IconButton
          iconName="arrowLeft"
          accessibilityLabel={backLabel ?? title}
          onPress={onBackPress}
        />
      )}
      {headerAccessory === undefined ? null : (
        <View style={createHeaderAccessoryStyle(theme)}>{headerAccessory}</View>
      )}
      <View style={createHeaderStyle(theme)}>
        <Text variant="titleLg" align={textAlign}>
          {title}
        </Text>
        {subtitle === undefined ? null : (
          <Text variant="body" color="ink2" align={textAlign}>
            {subtitle}
          </Text>
        )}
      </View>
    </>
  );
}
