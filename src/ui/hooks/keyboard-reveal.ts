import { createContext, useContext } from 'react';

/** Espacio que se deja entre el borde inferior del campo y el teclado al desplazar. */
export const REVEAL_MARGIN = 16;

interface RevealRequest {
  /** Borde inferior del campo enfocado, en coordenadas de la ventana. */
  inputBottomY: number;
  /** Borde superior del teclado, en coordenadas de la ventana. */
  keyboardTopY: number;
}

/** Cuánto hay que desplazar el scroll hacia abajo para que el campo no quede bajo el teclado; 0 si ya se ve. */
export function calculateRevealOffset({ inputBottomY, keyboardTopY }: RevealRequest): number {
  return Math.max(inputBottomY + REVEAL_MARGIN - keyboardTopY, 0);
}

export type RevealFocusedInput = () => void;

/**
 * Lo que un campo de texto pide al scroll de su pantalla al recibir el foco: que, si el teclado
 * ya está abierto, lo desplace hasta dejarlo a la vista. Fuera de una pantalla no hace nada.
 */
export const KeyboardRevealContext = createContext<RevealFocusedInput>(() => undefined);

export function useRevealFocusedInput(): RevealFocusedInput {
  return useContext(KeyboardRevealContext);
}
