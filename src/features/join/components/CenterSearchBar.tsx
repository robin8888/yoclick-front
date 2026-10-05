import { Controller, type Control } from 'react-hook-form';
import { TextInput, View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { platformCardColors, useTheme } from '@/shared/theme';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import type { CenterSearchFormValues } from '../schemas/center-search.schema';
import {
  CENTER_SEARCH_FIELD_STYLE,
  createSearchBarStyle,
  createSearchInputStyle,
} from './CenterSearchBar.styles';

interface CenterSearchBarProps {
  control: Control<CenterSearchFormValues>;
  onSubmitEditing: () => void;
}

/** Buscador grande: píldora blanca con lupa, el texto en burdeos y el error debajo. */
export function CenterSearchBar({
  control,
  onSubmitEditing,
}: Readonly<CenterSearchBarProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <Controller
      control={control}
      name="searchQuery"
      render={({ field, fieldState }) => (
        <View style={CENTER_SEARCH_FIELD_STYLE}>
          <View style={createSearchBarStyle(theme, fieldState.error !== undefined)}>
            <Icon name="search" size="navigation" tintColor={platformCardColors.icon} />
            <TextInput
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              onSubmitEditing={onSubmitEditing}
              accessibilityLabel={i18n.t('join.search.fieldLabel')}
              placeholder={i18n.t('join.search.placeholder')}
              placeholderTextColor={platformCardColors.description}
              returnKeyType="search"
              autoCorrect={false}
              style={createSearchInputStyle()}
            />
          </View>
          {fieldState.error === undefined ? null : (
            <Text variant="caption" color="danger" align="center" role="alert">
              {fieldState.error.message}
            </Text>
          )}
        </View>
      )}
    />
  );
}
