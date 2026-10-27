import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';

import { FLEXIBLE_TEXT_STYLE } from './Panel.styles';

const NAVIGATOR_STYLE = { flexDirection: 'row', alignItems: 'center', gap: 8 } as const;
const PERIOD_LABEL_STYLE = { alignItems: 'center' } as const;

interface PeriodNavigatorProps {
  periodLabel: string;
  canGoNext: boolean;
  onPreviousPress: () => void;
  onNextPress: () => void;
}

/** Pasa de un mes o trimestre al anterior o al siguiente; no deja avanzar más allá del actual. */
export function PeriodNavigator({
  periodLabel,
  canGoNext,
  onPreviousPress,
  onNextPress,
}: Readonly<PeriodNavigatorProps>): React.JSX.Element {
  return (
    <View style={NAVIGATOR_STYLE}>
      <Button
        variant="outline"
        size="sm"
        label="‹"
        accessibilityLabel={i18n.t('platform.charges.previousPeriod')}
        onPress={onPreviousPress}
      />
      <View style={[FLEXIBLE_TEXT_STYLE, PERIOD_LABEL_STYLE]} accessibilityLiveRegion="polite">
        <Text variant="bodyStrong">{periodLabel}</Text>
      </View>
      <Button
        variant="outline"
        size="sm"
        label="›"
        accessibilityLabel={i18n.t('platform.charges.nextPeriod')}
        isDisabled={!canGoNext}
        onPress={onNextPress}
      />
    </View>
  );
}
