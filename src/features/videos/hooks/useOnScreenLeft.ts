import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

/**
 * Avisa cuando la pantalla deja de verse (otra pestaña, otra ruta apilada). Esas pantallas siguen
 * montadas por debajo, así que algo que suena, como un vídeo, tiene que enterarse por aquí.
 * `onLeave` debe ser estable (`useCallback` o un setter): si cambia en cada render, se llamaría sin salir.
 */
export function useOnScreenLeft(onLeave: () => void): void {
  useFocusEffect(useCallback(() => onLeave, [onLeave]));
}
