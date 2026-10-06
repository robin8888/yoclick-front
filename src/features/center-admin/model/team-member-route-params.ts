import { z } from 'zod';

const teamMemberRouteParamsSchema = z.object({ membershipId: z.uuid() });

export type TeamMemberRouteParams = z.infer<typeof teamMemberRouteParamsSchema>;

/** El parámetro de ruta es entrada no confiable (SEC-M4): `null` si no es un UUID. */
export function parseTeamMemberRouteParams(rawParams: unknown): TeamMemberRouteParams | null {
  const parsedParams = teamMemberRouteParamsSchema.safeParse(rawParams);
  return parsedParams.success ? parsedParams.data : null;
}
