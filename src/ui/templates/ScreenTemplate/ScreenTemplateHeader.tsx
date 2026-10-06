import { View } from 'react-native';

import { useBackAction, useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import { ScreenBackButton } from './ScreenBackButton';
import {
  createHeaderAccessoryStyle,
  createHeaderStyle,
  createTitleRowStyle,
  TITLE_BLOCK_STYLE,
} from './ScreenTemplate.styles';
import type { ScreenTemplateProps } from './ScreenTemplate.types';

type ScreenTemplateHeaderProps = Pick<
  ScreenTemplateProps,
  'title' | 'subtitle' | 'onBackPress' | 'backLabel' | 'headerAccessory' | 'isHeaderCentered'
>;

/** La acción de volver: la que pasa la pantalla o, si no, la del historial (nunca en una raíz). */
function useBackButton({
  title,
  onBackPress,
  backLabel,
}: Pick<ScreenTemplateProps, 'title' | 'onBackPress' | 'backLabel'>): React.JSX.Element | null {
  const defaultBackAction = useBackAction();
  const handleBackPress = onBackPress ?? defaultBackAction?.onBackPress;
  if (handleBackPress === undefined) return null;
  return (
    <ScreenBackButton
      accessibilityLabel={backLabel ?? defaultBackAction?.backLabel ?? title}
      onPress={handleBackPress}
    />
  );
}

function TitleBlock({
  title,
  subtitle,
  isCentered,
}: Readonly<{
  title: string;
  subtitle: string | undefined;
  isCentered: boolean;
}>): React.JSX.Element {
  const theme = useTheme();
  const textAlign = isCentered ? 'center' : 'left';

  return (
    <View style={[createHeaderStyle(theme), isCentered ? null : TITLE_BLOCK_STYLE]}>
      <Text variant="titleLg" align={textAlign}>
        {title}
      </Text>
      {subtitle === undefined ? null : (
        <Text variant="body" color="ink2" align={textAlign}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

/**
 * La flecha de volver va delante del título, como en el prototipo. Sale en toda pantalla con
 * historial que no sea la raíz de una pestaña, aunque la pantalla no pase su propia acción.
 */
export function ScreenTemplateHeader(
  props: Readonly<ScreenTemplateHeaderProps>,
): React.JSX.Element {
  const theme = useTheme();
  const backButton = useBackButton(props);
  const isCentered = props.isHeaderCentered ?? false;
  const titleBlock = (
    <TitleBlock title={props.title} subtitle={props.subtitle} isCentered={isCentered} />
  );

  return (
    <>
      {props.headerAccessory === undefined ? null : (
        <View style={createHeaderAccessoryStyle(theme)}>{props.headerAccessory}</View>
      )}
      {isCentered ? (
        <>
          {backButton}
          {titleBlock}
        </>
      ) : (
        <View style={createTitleRowStyle(theme)}>
          {backButton}
          {titleBlock}
        </View>
      )}
    </>
  );
}
