import { z } from 'zod';

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Los parámetros de ruta no son de fiar: se validan antes de usarlos en una petición.
export const classSessionRouteParamsSchema = z.object({
  bookingId: z.uuid(),
  date: z.string().regex(ISO_DATE_PATTERN),
});
