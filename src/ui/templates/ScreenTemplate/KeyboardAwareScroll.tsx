import type { ReactNode } from 'react';
import { ScrollView } from 'react-native';

import { useTheme } from '@/shared/theme';

import { createContentStyle } from './ScreenTemplate.styles';
import { useScrollFocusedInputIntoView } from './useScrollFocusedInputIntoView';

interface KeyboardAwareScrollProps {
  isContentCentered: boolean;
  children: ReactNode;
}

/** El contenido con scroll de una pantalla: al escribir, el campo con foco sube sobre el teclado. */
export function KeyboardAwareScroll({
  isContentCentered,
  children,
}: Readonly<KeyboardAwareScrollProps>): React.JSX.Element {
  const theme = useTheme();
  const { scrollViewRef, handleContentTouchEnd } = useScrollFocusedInputIntoView();

  return (
    <ScrollView
      ref={scrollViewRef}
      contentContainerStyle={createContentStyle(theme, isContentCentered)}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      onTouchEnd={handleContentTouchEnd}
    >
      {children}
    </ScrollView>
  );
}
