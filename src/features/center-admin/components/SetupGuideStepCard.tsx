import { Pressable, View } from 'react-native';

import { i18n } from '@/shared/i18n';
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
  /** El paso ya está hecho: se marca con la palabra «Hecho» y el lector de pantalla lo anuncia. */
  isDone?: boolean;
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

interface StepTitleRowProps {
  iconName: IconName;
  title: string;
  badgeLabel: string | undefined;
  isDone: boolean;
}

/** El icono, el título y las etiquetas del paso («Premium», «Hecho») en una sola línea. */
function StepTitleRow({
  iconName,
  title,
  badgeLabel,
  isDone,
}: Readonly<StepTitleRowProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createStepTitleRowStyle(theme)}>
      <Icon name={iconName} color="brandInk" />
      <View style={createStepTitleStyle()}>
        <Text variant="bodyStrong">{title}</Text>
      </View>
      {badgeLabel === undefined ? null : <Badge label={badgeLabel} tone="brand" />}
      {isDone ? <Badge label={i18n.t('centerAdmin.setupGuide.doneBadge')} tone="success" /> : null}
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
  isDone = false,
  onPress,
}: Readonly<SetupGuideStepCardProps>): React.JSX.Element {
  const theme = useTheme();
  const doneWord = isDone ? i18n.t('centerAdmin.setupGuide.doneBadge') : '';
  const style = usePressableStyle({
    baseStyle: createStepCardStyle(theme),
    pressedScale: motionTokens.pressScaleButton,
    isEnabled: true,
  });

  return (
    <Pressable
      role="button"
      accessibilityLabel={[`${String(position)}. ${title}`, description, doneWord]
        .filter(Boolean)
        .join('. ')}
      onPress={onPress}
      style={style}
    >
      <StepNumber position={position} />
      <View style={createStepContentStyle(theme)}>
        <View style={createStepTextStyle(theme)}>
          <StepTitleRow iconName={iconName} title={title} badgeLabel={badgeLabel} isDone={isDone} />
          <Text variant="caption" color="ink2">
            {description}
          </Text>
        </View>
        <Icon name="chevronRight" color="ink2" />
      </View>
    </Pressable>
  );
}
