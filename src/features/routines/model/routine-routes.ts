import type { Href } from 'expo-router';
import { z } from 'zod';

/** Las rutinas se gestionan desde dos zonas: administración y equipo. Cada una tiene sus rutas. */
export type RoutineRouteBase = '/(admin)/routines' | '/(staff)/routines';

export function buildNewRoutineRoute(routeBase: RoutineRouteBase): Href {
  return `${routeBase}/new` as Href;
}

export function buildRoutineDetailRoute(routeBase: RoutineRouteBase, routineId: string): Href {
  return `${routeBase}/${routineId}` as Href;
}

const routineRouteParamsSchema = z.object({ routineId: z.uuid() });

/** El parámetro de ruta es entrada no confiable (SEC-M4): `null` si no es un UUID. */
export function parseRoutineRouteParams(rawParams: unknown): { routineId: string } | null {
  const parsedParams = routineRouteParamsSchema.safeParse(rawParams);
  return parsedParams.success ? parsedParams.data : null;
}
