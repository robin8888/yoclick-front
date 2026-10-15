import type { Href } from 'expo-router';
import { z } from 'zod';

/** `guardian`: un tutor, que entra como cliente pero no como alumno. */
export type InvitedRole = 'client' | 'staff' | 'guardian';

export function buildInvitePersonRoute(role: InvitedRole): Href {
  return `/(admin)/invite-person?role=${role}` as Href;
}

const invitePersonParamsSchema = z.object({ role: z.enum(['client', 'staff', 'guardian']) });

/** El rol llega por la ruta: es entrada no confiable (SEC-M4), `null` si no es uno de los dos. */
export function parseInvitePersonParams(rawParams: unknown): { role: InvitedRole } | null {
  const parsedParams = invitePersonParamsSchema.safeParse(rawParams);
  return parsedParams.success ? parsedParams.data : null;
}
