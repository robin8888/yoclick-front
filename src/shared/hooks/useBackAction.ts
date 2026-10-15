import { useRouter } from 'expo-router';

/**
 * La acción de la flecha de volver de una pantalla: vuelve a la anterior y, si no hay ninguna (se
 * abrió desde un enlace o es la primera), no hay flecha en vez de una que no hace nada.
 */
export function useBackAction(): (() => void) | undefined {
  const router = useRouter();
  return router.canGoBack() ? router.back : undefined;
}
