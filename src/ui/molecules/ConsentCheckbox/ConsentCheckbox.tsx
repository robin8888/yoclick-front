import { View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { Checkbox } from '@/ui/atoms/Checkbox';
import { Text } from '@/ui/atoms/Text';

import { CONSENT_LABEL_STYLE, createConsentRowStyle } from './ConsentCheckbox.styles';
import type { ConsentCheckboxProps } from './ConsentCheckbox.types';

export function ConsentCheckbox({
  isChecked,
  onCheckedChange,
  label,
  errorMessage,
}: Readonly<ConsentCheckboxProps>): React.JSX.Element {
  const theme = useTheme();
  const isInvalid = errorMessage !== undefined;

  return (
    <View>
      <View style={createConsentRowStyle(theme)}>
        <Checkbox
          isChecked={isChecked}
          onCheckedChange={onCheckedChange}
          accessibilityLabel={label}
          isInvalid={isInvalid}
        />
        <View style={CONSENT_LABEL_STYLE}>
          <Text variant="body">{label}</Text>
        </View>
      </View>
      {isInvalid ? (
        <Text variant="caption" color="danger" role="alert">
          {errorMessage}
        </Text>
      ) : null}
    </View>
  );
}
