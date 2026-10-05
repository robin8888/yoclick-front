import { z } from 'zod';

const serviceRouteParamsSchema = z.object({
  serviceId: z.union([z.literal('new'), z.uuid()]),
});

export type ServiceRouteParams = z.infer<typeof serviceRouteParamsSchema>;

/** El parámetro de ruta es entrada no confiable (SEC-M4): `null` si no es `new` ni un UUID. */
export function parseServiceRouteParams(rawParams: unknown): ServiceRouteParams | null {
  const parsedParams = serviceRouteParamsSchema.safeParse(rawParams);
  return parsedParams.success ? parsedParams.data : null;
}
