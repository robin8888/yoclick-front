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

type PreSignOutTask = () => Promise<void>;

const registeredPreSignOutTasks: PreSignOutTask[] = [];

/**
 * Lo que hay que hacer MIENTRAS la sesión sigue abierta, porque necesita el token de acceso: por
 * ejemplo dar de baja el móvil de los avisos push. Un fallo no impide cerrar la sesión.
 */
export function registerPreSignOutTask(task: PreSignOutTask): void {
  registeredPreSignOutTasks.push(task);
}

export async function runPreSignOutTasks(): Promise<void> {
  for (const task of registeredPreSignOutTasks) {
    try {
      await task();
    } catch {
      // El móvil se quedará registrado hasta que el servicio de avisos lo dé por muerto: no se bloquea el cierre.
    }
  }
}
