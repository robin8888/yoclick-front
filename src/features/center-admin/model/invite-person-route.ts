import type { Href } from 'expo-router';
import { z } from 'zod';

export type InvitedRole = 'client' | 'staff';

export function buildInvitePersonRoute(role: InvitedRole): Href {
  return `/(admin)/invite-person?role=${role}` as Href;
}

const invitePersonParamsSchema = z.object({ role: z.enum(['client', 'staff']) });

/** El rol llega por la ruta: es entrada no confiable (SEC-M4), `null` si no es uno de los dos. */
export function parseInvitePersonParams(rawParams: unknown): { role: InvitedRole } | null {
  const parsedParams = invitePersonParamsSchema.safeParse(rawParams);
  return parsedParams.success ? parsedParams.data : null;
}
