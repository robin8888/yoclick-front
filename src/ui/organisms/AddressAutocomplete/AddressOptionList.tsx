import { Fragment } from 'react';
import { Pressable, View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import {
  createOptionListStyle,
  createOptionRowStyle,
  createOptionSeparatorStyle,
  OPTION_TEXT_STYLE,
} from './AddressAutocomplete.styles';
import type { AddressOption } from './AddressAutocomplete.types';

interface AddressOptionListProps {
  options: readonly AddressOption[];
  onOptionSelect: (optionId: string) => void;
}

export function AddressOptionList({
  options,
  onOptionSelect,
}: Readonly<AddressOptionListProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createOptionListStyle(theme)}>
      {options.map((option, index) => (
        <Fragment key={option.id}>
          {index === 0 ? null : <View style={createOptionSeparatorStyle(theme)} />}
          <Pressable
            role="button"
            accessibilityLabel={option.title}
            onPress={() => {
              onOptionSelect(option.id);
            }}
            style={createOptionRowStyle(theme)}
          >
            <Icon name="mapPin" color="brandInk" />
            <View style={OPTION_TEXT_STYLE}>
              <Text>{option.title}</Text>
            </View>
          </Pressable>
        </Fragment>
      ))}
    </View>
  );
}
