import { View } from 'react-native';

import { Chip } from '@/ui/atoms/Chip';
import { Text } from '@/ui/atoms/Text';

import type { ChoiceOption } from '../model/choice-option';
import { STACK_STYLE, WRAP_ROW_STYLE } from './Content.styles';

interface SingleChoiceChipsProps<TValue> {
  title: string;
  options: readonly ChoiceOption<TValue>[];
  selectedValue: TValue;
  /** En los filtros el título solo lo lee el lector de pantalla: el prototipo no lo enseña. */
  isTitleHidden?: boolean;
  onSelect: (value: TValue) => void;
}

/** Una opción entre varias, con título: el nivel o la necesidad de un contenido, o un filtro. */
export function SingleChoiceChips<TValue extends string | null>({
  title,
  options,
  selectedValue,
  isTitleHidden = false,
  onSelect,
}: Readonly<SingleChoiceChipsProps<TValue>>): React.JSX.Element {
  return (
    <View style={STACK_STYLE}>
      {isTitleHidden ? null : <Text variant="bodyStrong">{title}</Text>}
      <View role="radiogroup" accessibilityLabel={title} style={WRAP_ROW_STYLE}>
        {options.map((option) => (
          <Chip
            key={option.value ?? 'none'}
            label={option.label}
            isSelected={option.value === selectedValue}
            onPress={() => {
              onSelect(option.value);
            }}
          />
        ))}
      </View>
    </View>
  );
}
