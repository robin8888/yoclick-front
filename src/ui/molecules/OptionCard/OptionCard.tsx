import { Pressable, View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import { createOptionCardStyle, DISABLED_STYLE, OPTION_CARD_TEXT_STYLE } from './OptionCard.styles';
import type { OptionCardProps } from './OptionCard.types';
import { OptionIndicator } from './OptionIndicator';

interface OptionCardTextProps {
  title: string;
  meta: string | undefined;
  description: string | undefined;
  disabledReason: string | undefined;
}

function OptionCardText({
  title,
  meta,
  description,
  disabledReason,
}: Readonly<OptionCardTextProps>): React.JSX.Element {
  return (
    <View style={OPTION_CARD_TEXT_STYLE}>
      <Text variant="bodyStrong">{title}</Text>
      {meta === undefined ? null : (
        <Text variant="caption" color="ink2">
          {meta}
        </Text>
      )}
      {disabledReason === undefined ? null : (
        <Text variant="caption" color="warning">
          {disabledReason}
        </Text>
      )}
      {description === undefined ? null : (
        <Text variant="caption" color="ink2">
          {description}
        </Text>
      )}
    </View>
  );
}

/** Una opción a elegir entre varias (selector circular): título, datos y descripción opcional. */
export function OptionCard({
  title,
  meta,
  description,
  leading,
  selectionMode = 'single',
  isSelected,
  isDisabled = false,
  disabledReason,
  onPress,
}: Readonly<OptionCardProps>): React.JSX.Element {
  const theme = useTheme();

  const indicator = <OptionIndicator selectionMode={selectionMode} isSelected={isSelected} />;

  return (
    <Pressable
      role={selectionMode === 'multiple' ? 'checkbox' : 'radio'}
      accessibilityLabel={[title, meta, isDisabled ? disabledReason : undefined]
        .filter(Boolean)
        .join('. ')}
      accessibilityState={{ selected: isSelected, checked: isSelected, disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      style={[createOptionCardStyle(theme, isSelected), isDisabled ? DISABLED_STYLE : null]}
    >
      {leading ?? indicator}
      <OptionCardText
        title={title}
        meta={meta}
        description={description}
        disabledReason={isDisabled ? disabledReason : undefined}
      />
      {leading === undefined ? null : indicator}
    </Pressable>
  );
}
