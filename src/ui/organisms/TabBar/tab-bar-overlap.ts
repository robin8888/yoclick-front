import { createContext, useContext } from 'react';

/**
 * Lo que la barra flotante tapa del borde inferior (su altura con el margen). Las plantillas lo
 * suman a su contenido para que lo último de una lista o el botón fijo no queden bajo la barra.
 */
export const TabBarOverlapContext = createContext(0);

export function useTabBarOverlap(): number {
  return useContext(TabBarOverlapContext);
}
