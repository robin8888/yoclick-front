import Constants from 'expo-constants';

import { isAppVersionBelowMinimum } from '@/shared/lib/app-version';

import { useMinAppVersionStore } from './min-app-version-store';

interface AppUpdateCheckDependencies {
  /** Versión instalada; por defecto la de `app.config.ts`. */
  currentAppVersion?: string;
  /** Inyectable para probar el bloqueo sin depender de la lógica de versiones real. */
  isBelowMinimum?: (currentVersion: string, minimumVersion: string) => boolean;
}

/** ¿Debe la app bloquearse con la pantalla «Actualización obligatoria»? */
export function useIsAppUpdateRequired({
  currentAppVersion = Constants.expoConfig?.version ?? '0.0.0',
  isBelowMinimum = isAppVersionBelowMinimum,
}: AppUpdateCheckDependencies = {}): boolean {
  const minimumAppVersion = useMinAppVersionStore((state) => state.minimumAppVersion);
  if (minimumAppVersion === null) return false;
  return isBelowMinimum(currentAppVersion, minimumAppVersion);
}
