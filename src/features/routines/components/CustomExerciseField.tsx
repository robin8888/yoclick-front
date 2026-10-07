import { useState } from 'react';
import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Input } from '@/ui/atoms/Input';

import { GROW_STYLE, ROW_STYLE } from './RoutinesCommon.styles';

interface CustomExerciseFieldProps {
  onExerciseAdd: (name: string) => void;
  isDisabled: boolean;
}

/** Un ejercicio que no está en la biblioteca: se escribe y se añade al final. */
export function CustomExerciseField({
  onExerciseAdd,
  isDisabled,
}: Readonly<CustomExerciseFieldProps>): React.JSX.Element {
  const [name, setName] = useState('');

  return (
    <View style={ROW_STYLE}>
      <View style={GROW_STYLE}>
        <Input
          value={name}
          onChangeText={setName}
          accessibilityLabel={i18n.t('routines.builder.customLabel')}
          placeholder={i18n.t('routines.builder.customPlaceholder')}
          maxLength={120}
        />
      </View>
      <Button
        variant="outline"
        label={i18n.t('routines.builder.customAction')}
        isDisabled={isDisabled || name.trim() === ''}
        onPress={() => {
          onExerciseAdd(name);
          setName('');
        }}
      />
    </View>
  );
}
