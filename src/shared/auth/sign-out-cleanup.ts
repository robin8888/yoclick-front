type SignOutCleanup = () => void;

const registeredCleanups: SignOutCleanup[] = [];

/**
 * Cada módulo que guarda estado de una sesión (borradores de «Unirse», alta de centro…) registra
 * aquí cómo olvidarlo. Así el cierre de sesión se puede lanzar desde cualquier pantalla sin que
 * unos módulos dependan de otros.
 */
export function registerSignOutCleanup(cleanup: SignOutCleanup): void {
  registeredCleanups.push(cleanup);
}

export function runSignOutCleanups(): void {
  for (const cleanup of registeredCleanups) cleanup();
}
