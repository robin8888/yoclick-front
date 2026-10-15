import { Pressable, View } from 'react-native';

import { motionTokens, usePressableStyle, useTheme } from '@/shared/theme';
import { Badge } from '@/ui/atoms/Badge';
import { Icon, type IconName } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import {
  createStepCardStyle,
  createStepContentStyle,
  createStepNumberStyle,
  createStepTextStyle,
  createStepTitleRowStyle,
  createStepTitleStyle,
} from './SetupGuideStepCard.styles';

/** Tope del escalado: un número enorme con letra grande rompería la tarjeta. */
const NUMBER_MAX_FONT_SIZE_MULTIPLIER = 1.2;

interface SetupGuideStepCardProps {
  position: number;
  iconName: IconName;
  title: string;
  description: string;
  /** Una etiqueta que avisa de una condición del paso (p. ej. «Premium»). */
  badgeLabel?: string | undefined;
  onPress: () => void;
}

/** Decorativo: el número ya va en la etiqueta accesible de la tarjeta. */
function StepNumber({ position }: Readonly<{ position: number }>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View
      style={createStepNumberStyle(theme)}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Text variant="display" color="ink2" maxFontSizeMultiplier={NUMBER_MAX_FONT_SIZE_MULTIPLIER}>
        {String(position)}
      </Text>
    </View>
  );
}

/**
 * Un paso de «Primeros pasos»: el número grande y en gris claro a la izquierda y, a su lado, el
 * icono delante del título, qué hacer y una flecha que lo abre.
 */
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
      <StepNumber position={position} />
      <View style={createStepContentStyle(theme)}>
        <View style={createStepTextStyle(theme)}>
          <View style={createStepTitleRowStyle(theme)}>
            <Icon name={iconName} color="brandInk" />
            <View style={createStepTitleStyle()}>
              <Text variant="bodyStrong">{title}</Text>
            </View>
            {badgeLabel === undefined ? null : <Badge label={badgeLabel} tone="brand" />}
          </View>
          <Text variant="caption" color="ink2">
            {description}
          </Text>
        </View>
        <Icon name="chevronRight" color="ink2" />
      </View>
    </Pressable>
  );
}
