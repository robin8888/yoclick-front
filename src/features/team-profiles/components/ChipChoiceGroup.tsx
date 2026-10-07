import { Pressable, View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import { createChipStyle, STACK_STYLE, WRAP_ROW_STYLE } from './TeamProfiles.styles';

interface ChipChoiceGroupProps {
  title: string;
  options: readonly string[];
  chosen: readonly string[];
  onToggle: (option: string) => void;
}

/** Varias opciones a la vez (especialidades, idiomas): cada chip es una casilla con su estado. */
export function ChipChoiceGroup({
  title,
  options,
  chosen,
  onToggle,
}: Readonly<ChipChoiceGroupProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={STACK_STYLE}>
      <Text variant="bodyStrong">{title}</Text>
      <View style={WRAP_ROW_STYLE}>
        {options.map((option) => {
          const isSelected = chosen.includes(option);
          return (
            <Pressable
              key={option}
              accessibilityRole="checkbox"
              accessibilityLabel={option}
              accessibilityState={{ checked: isSelected }}
              onPress={() => {
                onToggle(option);
              }}
              style={createChipStyle(theme, isSelected)}
            >
              {isSelected ? <Icon name="check" color="brandInk" /> : null}
              <Text color={isSelected ? 'brandInk' : 'ink'}>{option}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
