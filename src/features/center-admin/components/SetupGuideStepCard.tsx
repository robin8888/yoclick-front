import { Pressable, View } from 'react-native';

import { motionTokens, usePressableStyle, useTheme } from '@/shared/theme';
import { Badge } from '@/ui/atoms/Badge';
import { Icon, type IconName } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import {
  createStepCardStyle,
  createStepIconTileStyle,
  createStepNumberPillStyle,
  createStepTextStyle,
  createStepTitleRowStyle,
} from './SetupGuideStepCard.styles';

interface SetupGuideStepCardProps {
  position: number;
  iconName: IconName;
  title: string;
  description: string;
  /** Una etiqueta que avisa de una condición del paso (p. ej. «Premium»). */
  badgeLabel?: string | undefined;
  onPress: () => void;
}

function StepNumberPill({ position }: Readonly<{ position: number }>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createStepNumberPillStyle(theme)}>
      <Text variant="caption" color="onBrand">
        {String(position)}
      </Text>
    </View>
  );
}

/** Un paso de «Primeros pasos»: su icono con el número, qué hacer y una flecha que lo abre. */
export function SetupGuideStepCard({
  position,
  iconName,
  title,
  description,
  badgeLabel,
  onPress,
}: Readonly<SetupGuideStepCardProps>): React.JSX.Element {
  const theme = useTheme();
  const style = usePressableStyle({
    baseStyle: createStepCardStyle(theme),
    pressedScale: motionTokens.pressScaleButton,
    isEnabled: true,
  });

  return (
    <Pressable
      role="button"
      accessibilityLabel={`${String(position)}. ${title}. ${description}`}
      onPress={onPress}
      style={style}
    >
      <View style={createStepIconTileStyle(theme)}>
        <Icon name={iconName} size="navigation" color="brandInk" />
        <StepNumberPill position={position} />
      </View>
      <View style={createStepTextStyle(theme)}>
        <View style={createStepTitleRowStyle(theme)}>
          <Text variant="bodyStrong">{title}</Text>
          {badgeLabel === undefined ? null : <Badge label={badgeLabel} tone="brand" />}
        </View>
        <Text variant="caption" color="ink2">
          {description}
        </Text>
      </View>
      <Icon name="chevronRight" color="ink2" />
    </Pressable>
  );
}
