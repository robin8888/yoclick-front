import { useState } from 'react';
import type { GestureResponderEvent, LayoutChangeEvent } from 'react-native';

export interface DragPosition {
  /** Posición del dedo dentro de la superficie, de 0 a 1 en cada eje. */
  horizontal: number;
  vertical: number;
}

function clampToUnit(position: number): number {
  return Math.min(1, Math.max(0, position));
}

/**
 * Convierte arrastrar el dedo sobre una superficie en una posición de 0 a 1. La superficie no cede
 * el gesto a la lista que tiene debajo, para que arrastrar el tono no desplace la pantalla.
 */
export function useDragPosition(onDrag: (position: DragPosition) => void): {
  size: { width: number; height: number };
  responderProps: {
    onStartShouldSetResponder: () => boolean;
    onMoveShouldSetResponder: () => boolean;
    onResponderTerminationRequest: () => boolean;
    onResponderGrant: (event: GestureResponderEvent) => void;
    onResponderMove: (event: GestureResponderEvent) => void;
    onLayout: (event: LayoutChangeEvent) => void;
  };
} {
  const [size, setSize] = useState({ width: 1, height: 1 });
  const report = (event: GestureResponderEvent): void => {
    const { locationX, locationY } = event.nativeEvent;
    onDrag({
      horizontal: clampToUnit(locationX / size.width),
      vertical: clampToUnit(locationY / size.height),
    });
  };

  return {
    size,
    responderProps: {
      onStartShouldSetResponder: () => true,
      onMoveShouldSetResponder: () => true,
      onResponderTerminationRequest: () => false,
      onResponderGrant: report,
      onResponderMove: report,
      onLayout: ({ nativeEvent }) => {
        setSize(nativeEvent.layout);
      },
    },
  };
}
