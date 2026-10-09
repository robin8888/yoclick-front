import { z } from 'zod';

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Los parámetros de ruta no son de fiar: se validan antes de usarlos en una petición.
export const rescheduleAppointmentRouteParamsSchema = z.object({
  bookingId: z.uuid(),
  serviceId: z.uuid(),
  /** Quien da la cita: la hora nueva se busca en su agenda. */
  staffMembershipId: z.uuid(),
  /** El día de la cita actual; desde ahí se empieza a buscar hueco. */
  date: z.string().regex(ISO_DATE_PATTERN),
});
