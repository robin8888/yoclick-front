import { usePathname, useRouter } from 'expo-router';
import { createContext, useContext, type ReactNode } from 'react';

import { i18n } from '@/shared/i18n';

/**
 * Las pantallas raíz de cada pestaña no llevan flecha de volver: se llega a ellas desde la barra
 * de navegación, no desde otra pantalla. Cualquier otra pantalla con historial sí la lleva.
 */
const TAB_ROOT_PATHS: readonly string[] = [
  '/',
  '/agenda',
  '/clients',
  '/notifications',
  '/profile',
  '/more',
  '/brand',
  '/content',
  '/home',
  '/book',
  '/bookings',
  '/practice',
];

export interface BackAction {
  onBackPress: () => void;
  /** «Volver», para el lector de pantalla. */
  backLabel: string;
}

const BackActionContext = createContext<BackAction | null>(null);

export function BackActionProvider({
  children,
}: Readonly<{ children: ReactNode }>): React.JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const canGoBack = router.canGoBack() && !TAB_ROOT_PATHS.includes(pathname);

  return (
    <BackActionContext.Provider
      value={canGoBack ? { onBackPress: router.back, backLabel: i18n.t('actions.back') } : null}
    >
      {children}
    </BackActionContext.Provider>
  );
}

/** Cómo volver a la pantalla anterior; `null` si esta es una raíz de pestaña o no hay historial. */
export function useBackAction(): BackAction | null {
  return useContext(BackActionContext);
}
