import type { Href } from 'expo-router';
import { z } from 'zod';

// Los parámetros de ruta no son de fiar: se validan antes de usarlos en una petición.
export const contentRouteParamsSchema = z.object({ id: z.uuid() });

/** La ruta de la pantalla que enseña un vídeo o un PDF a quien lo tiene asignado. */
export function buildContentMediaRoute(contentId: string): Href {
  return `/(client)/content/${contentId}` as Href;
}
