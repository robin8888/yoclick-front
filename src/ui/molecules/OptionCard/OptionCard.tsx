import { Pressable, View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import { createOptionCardStyle, OPTION_CARD_TEXT_STYLE } from './OptionCard.styles';
import type { OptionCardProps } from './OptionCard.types';
import { OptionIndicator } from './OptionIndicator';

/** Una opción a elegir entre varias (selector circular): título, datos y descripción opcional. */
export function OptionCard({
  title,
  meta,
  description,
  leading,
  selectionMode = 'single',
  isSelected,
  onPress,
}: Readonly<OptionCardProps>): React.JSX.Element {
  const theme = useTheme();

  const indicator = <OptionIndicator selectionMode={selectionMode} isSelected={isSelected} />;

  return (
    <Pressable
      role={selectionMode === 'multiple' ? 'checkbox' : 'radio'}
      accessibilityLabel={[title, meta].filter(Boolean).join('. ')}
      accessibilityState={{ selected: isSelected, checked: isSelected }}
      onPress={onPress}
      style={createOptionCardStyle(theme, isSelected)}
    >
      {leading ?? indicator}
      <View style={OPTION_CARD_TEXT_STYLE}>
        <Text variant="bodyStrong">{title}</Text>
        {meta === undefined ? null : (
          <Text variant="caption" color="ink2">
            {meta}
          </Text>
        )}
        {description === undefined ? null : (
          <Text variant="caption" color="ink2">
            {description}
          </Text>
        )}
      </View>
      {leading === undefined ? null : indicator}
    </Pressable>
  );
}
