import type { ComponentProps, ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { platformHeroColorOverrides, ThemeProvider, useTheme } from '@/shared/theme';

import {
  createFooterStyle,
  FLOATING_ACTION_STYLE,
  createScreenStyle,
  TRANSPARENT_SAFE_AREA_STYLE,
} from './ScreenTemplate.styles';
import type { ScreenTemplateProps } from './ScreenTemplate.types';
import { useIsKeyboardVisible } from '@/ui/hooks/useIsKeyboardVisible';
import { BusyOverlay } from '@/ui/molecules/BusyOverlay';
import { KeyboardAwareScroll } from './KeyboardAwareScroll';
import { CenterHoneycombBackground } from './CenterHoneycombBackground';
import { PlatformHeroBackground } from './PlatformHeroBackground';
import { ScreenTemplateTop } from './ScreenTemplateTop';

const KEYBOARD_AVOIDING_STYLE = { flex: 1 } as const;

/** Esqueleto de pantalla: zona segura, cabecera, contenido con scroll y acción fija abajo. */
export function ScreenTemplate(props: Readonly<ScreenTemplateProps>): React.JSX.Element {
  if (!props.hasPlatformHeroBackground) return <ScreenTemplateContent {...props} />;
  // Fondo granate con texto e iconos blancos: todo lo de dentro se pinta con ese tema.
  return (
    <ThemeProvider initialPreference="dark" colorOverrides={platformHeroColorOverrides}>
      <ScreenTemplateContent {...props} />
    </ThemeProvider>
  );
}

interface ScreenFooterProps {
  footer: ReactNode;
  hasPlatformHeroBackground: boolean;
}

/** La acción principal fija abajo; sin ella no se dibuja nada. */
function ScreenFooter({
  footer,
  hasPlatformHeroBackground,
}: Readonly<ScreenFooterProps>): React.JSX.Element | null {
  const theme = useTheme();
  if (footer === undefined) return null;
  return <View style={createFooterStyle(theme, hasPlatformHeroBackground)}>{footer}</View>;
}

type HeaderProps = Omit<ComponentProps<typeof ScreenTemplateTop>, 'hasPlatformHeroBackground'>;

interface ScreenHeaderSlotProps {
  isHidden: boolean;
  hasPlatformHeroBackground: boolean;
  headerProps: HeaderProps;
}

/** La cabecera estándar (marca, título y volver); las pantallas con título propio solo conservan la marca. */
function ScreenHeaderSlot({
  isHidden,
  hasPlatformHeroBackground,
  headerProps,
}: Readonly<ScreenHeaderSlotProps>): React.JSX.Element {
  return (
    <ScreenTemplateTop
      hasPlatformHeroBackground={hasPlatformHeroBackground}
      isTitleHidden={isHidden}
      {...headerProps}
    />
  );
}

interface FixedActionsProps {
  footer: ReactNode;
  floatingAction: ReactNode;
  hasPlatformHeroBackground: boolean;
}

/** Lo que queda fijo sobre el scroll: la acción principal abajo y el botón flotante (con el teclado cerrado). */
function FixedActions({
  footer,
  floatingAction,
  hasPlatformHeroBackground,
}: Readonly<FixedActionsProps>): React.JSX.Element {
  return (
    <>
      <ScreenFooter footer={footer} hasPlatformHeroBackground={hasPlatformHeroBackground} />
      {floatingAction === undefined ? null : (
        <View style={FLOATING_ACTION_STYLE} pointerEvents="box-none">
          {floatingAction}
        </View>
      )}
    </>
  );
}

interface ScreenFrameProps {
  hasPlatformHeroBackground: boolean;
  isLoading: boolean;
  loadingLabel: string | undefined;
  children: ReactNode;
}

/** El fondo (degradado de Yoclick o panal del centro) y, encima de todo, el velo de «cargando». */
function ScreenFrame({
  hasPlatformHeroBackground,
  isLoading,
  loadingLabel,
  children,
}: Readonly<ScreenFrameProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createScreenStyle(theme, hasPlatformHeroBackground)}>
      {hasPlatformHeroBackground ? <PlatformHeroBackground /> : <CenterHoneycombBackground />}
      {children}
      {isLoading ? <BusyOverlay loadingLabel={loadingLabel} /> : null}
    </View>
  );
}

/**
 * En Android la app va a pantalla completa y el sistema ya no encoge la ventana al salir el teclado:
 * se encoge aquí, para que el campo que se escribe quede a la vista. En iOS lo hace el scroll.
 */
function KeyboardAvoidingFrame({ children }: Readonly<{ children: ReactNode }>): React.JSX.Element {
  return (
    <KeyboardAvoidingView
      style={KEYBOARD_AVOIDING_STYLE}
      behavior="padding"
      enabled={Platform.OS === 'android'}
    >
      {children}
    </KeyboardAvoidingView>
  );
}

type ScreenBodyProps = Omit<ScreenTemplateProps, 'isLoading' | 'loadingLabel'>;

/** Zona segura con el contenido que hace scroll y, encima, las acciones fijas. */
function ScreenBody({
  footer,
  floatingAction,
  children,
  hasPlatformHeroBackground = false,
  isContentCentered = false,
  isHeaderHidden = false,
  ...headerProps
}: Readonly<ScreenBodyProps>): React.JSX.Element {
  const isKeyboardVisible = useIsKeyboardVisible();
  const footerView = (
    <ScreenFooter footer={footer} hasPlatformHeroBackground={hasPlatformHeroBackground} />
  );

  return (
    <KeyboardAvoidingFrame>
      <SafeAreaView style={TRANSPARENT_SAFE_AREA_STYLE}>
        <KeyboardAwareScroll
          isContentCentered={isContentCentered}
          trailingContent={isKeyboardVisible ? footerView : null}
        >
          <ScreenHeaderSlot
            isHidden={isHeaderHidden}
            hasPlatformHeroBackground={hasPlatformHeroBackground}
            headerProps={headerProps}
          />
          {children}
        </KeyboardAwareScroll>
        {isKeyboardVisible ? null : (
          <FixedActions
            footer={footer}
            floatingAction={floatingAction}
            hasPlatformHeroBackground={hasPlatformHeroBackground}
          />
        )}
      </SafeAreaView>
    </KeyboardAvoidingFrame>
  );
}

function ScreenTemplateContent({
  isLoading = false,
  loadingLabel,
  ...bodyProps
}: Readonly<ScreenTemplateProps>): React.JSX.Element {
  return (
    <ScreenFrame
      hasPlatformHeroBackground={bodyProps.hasPlatformHeroBackground ?? false}
      isLoading={isLoading}
      loadingLabel={loadingLabel}
    >
      <ScreenBody {...bodyProps} />
    </ScreenFrame>
  );
}
