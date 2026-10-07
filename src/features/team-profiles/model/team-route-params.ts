import { z } from 'zod';

// Los parámetros de ruta no son de fiar (deep links, restauración de navegación): se validan.
const teamMemberRouteParamsSchema = z.object({ membershipId: z.uuid() });

export function parseTeamMemberRouteParams(rawParams: unknown): { membershipId: string } | null {
  const parsed = teamMemberRouteParamsSchema.safeParse(rawParams);
  return parsed.success ? parsed.data : null;
}
