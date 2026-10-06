import type { ReactNode } from 'react';
import { ScrollView } from 'react-native';

import { useTheme } from '@/shared/theme';

import { createContentStyle } from './ScreenTemplate.styles';

interface KeyboardAwareScrollProps {
  isContentCentered: boolean;
  /** Va tras el contenido, dentro del scroll (el botón principal mientras el teclado está abierto). */
  trailingContent?: ReactNode;
  children: ReactNode;
}

/**
 * El contenido con scroll de una pantalla. En iOS, `automaticallyAdjustKeyboardInsets` hace que el
 * sistema deje sitio al teclado y desplace hasta el campo que se escribe, sin que tape nada;
 * Android redimensiona la ventana por sí solo. Arrastrar el contenido cierra el teclado.
 */
export function KeyboardAwareScroll({
  isContentCentered,
  trailingContent,
  children,
}: Readonly<KeyboardAwareScrollProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <ScrollView
      contentContainerStyle={createContentStyle(theme, isContentCentered)}
      automaticallyAdjustKeyboardInsets
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      {children}
      {trailingContent}
    </ScrollView>
  );
}
