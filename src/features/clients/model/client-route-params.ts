import { z } from 'zod';

const clientRouteParamsSchema = z.object({ membershipId: z.uuid() });
const groupRouteParamsSchema = z.object({ groupId: z.uuid() });

/** Los parámetros de ruta son entrada no confiable (SEC-M4): `null` si no son un UUID. */
export function parseClientRouteParams(rawParams: unknown): { membershipId: string } | null {
  const parsedParams = clientRouteParamsSchema.safeParse(rawParams);
  return parsedParams.success ? parsedParams.data : null;
}

export function parseGroupRouteParams(rawParams: unknown): { groupId: string } | null {
  const parsedParams = groupRouteParamsSchema.safeParse(rawParams);
  return parsedParams.success ? parsedParams.data : null;
}
