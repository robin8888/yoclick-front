import { Pressable, View } from 'react-native';

import { platformCardColors } from '@/shared/theme';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import {
  CHOICE_CARD_TEXT_STYLE,
  createChoiceCardStyle,
  createChoiceIndicatorStyle,
} from './ChoiceCard.styles';

export type ChoiceIndicator = 'radio' | 'checkbox';

interface ChoiceCardProps {
  label: string;
  /** `radio` para elegir una sola opción; `checkbox` para poder elegir varias. */
  indicator: ChoiceIndicator;
  isSelected: boolean;
  onPress: () => void;
}

/** Opción a todo el ancho, en tarjeta blanca; la elegida lleva borde dorado y marca (no solo color). */
export function ChoiceCard({
  label,
  indicator,
  isSelected,
  onPress,
}: Readonly<ChoiceCardProps>): React.JSX.Element {
  return (
    <Pressable
      role="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: isSelected }}
      onPress={onPress}
      style={createChoiceCardStyle(isSelected)}
    >
      <View style={CHOICE_CARD_TEXT_STYLE}>
        <Text variant="bodyStrong" tintColor={platformCardColors.title}>
          {label}
        </Text>
      </View>
      <View style={createChoiceIndicatorStyle({ indicator, isSelected })}>
        {isSelected ? (
          <Icon name="check" size="inline" tintColor={platformCardColors.title} />
        ) : null}
      </View>
    </Pressable>
  );
}
