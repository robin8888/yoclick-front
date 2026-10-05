import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { platformAccentColors, useTheme } from '@/shared/theme';
import { Icon, type IconName } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import { createFeatureChipStyle, FEATURE_CHIPS_ROW_STYLE } from './StartFeatureChips.styles';

interface StartFeature {
  iconName: IconName;
  labelKey: 'booking' | 'payments' | 'notices';
}

const START_FEATURES: readonly StartFeature[] = [
  { iconName: 'calendar', labelKey: 'booking' },
  { iconName: 'creditCard', labelKey: 'payments' },
  { iconName: 'bell', labelKey: 'notices' },
];

/** Tres ideas de lo que hace la app, en pastillas con icono. */
export function StartFeatureChips(): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={FEATURE_CHIPS_ROW_STYLE}>
      {START_FEATURES.map((feature) => (
        <View key={feature.labelKey} style={createFeatureChipStyle(theme)}>
          <Icon name={feature.iconName} tintColor={platformAccentColors.icon} />
          <Text variant="caption" tintColor={platformAccentColors.icon}>
            {i18n.t(`auth.start.features.${feature.labelKey}`)}
          </Text>
        </View>
      ))}
    </View>
  );
}
