import { View } from 'react-native';

import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';

const CHOICES_STYLE = { flexDirection: 'row', flexWrap: 'wrap', gap: 8 } as const;
const FIELD_STYLE = { gap: 8 } as const;

export interface Choice<TValue extends string> {
  value: TValue;
  label: string;
}

interface ChoiceButtonsProps<TValue extends string> {
  title: string;
  choices: readonly Choice<TValue>[];
  selectedValue: TValue;
  onChoose: (value: TValue) => void;
}

/** Elegir una opción entre pocas (nivel, grupo, responsable): la elegida va rellena y el resto con borde. */
export function ChoiceButtons<TValue extends string>({
  title,
  choices,
  selectedValue,
  onChoose,
}: Readonly<ChoiceButtonsProps<TValue>>): React.JSX.Element {
  return (
    <View style={FIELD_STYLE}>
      <Text variant="bodyStrong">{title}</Text>
      <View style={CHOICES_STYLE}>
        {choices.map((choice) => (
          <Button
            key={choice.value}
            size="sm"
            variant={choice.value === selectedValue ? 'primary' : 'outline'}
            label={choice.label}
            onPress={() => {
              onChoose(choice.value);
            }}
          />
        ))}
      </View>
    </View>
  );
}
