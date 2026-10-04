import { View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { IconButton } from '@/ui/atoms/IconButton';
import { Text } from '@/ui/atoms/Text';

import { createHeaderStyle } from './ScreenTemplate.styles';
import type { ScreenTemplateProps } from './ScreenTemplate.types';

type ScreenTemplateHeaderProps = Pick<
  ScreenTemplateProps,
  'title' | 'subtitle' | 'onBackPress' | 'backLabel'
>;

export function ScreenTemplateHeader({
  title,
  subtitle,
  onBackPress,
  backLabel,
}: Readonly<ScreenTemplateHeaderProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <>
      {onBackPress === undefined ? null : (
        <IconButton
          iconName="arrowLeft"
          accessibilityLabel={backLabel ?? title}
          onPress={onBackPress}
        />
      )}
      <View style={createHeaderStyle(theme)}>
        <Text variant="titleLg">{title}</Text>
        {subtitle === undefined ? null : (
          <Text variant="body" color="ink2">
            {subtitle}
          </Text>
        )}
      </View>
    </>
  );
}
