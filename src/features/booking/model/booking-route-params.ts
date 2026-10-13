import { z } from 'zod';

const MAX_STAFF_NAME_LENGTH = 120;

// Los parámetros de ruta no son de fiar (deep links, restauración de navegación): se validan.
export const serviceRouteParamsSchema = z.object({ serviceId: z.uuid() });

/** El paso de día y clase: el servicio; quién la da y en qué sala lo decide el centro. */
export const slotRouteParamsSchema = z.object({ serviceId: z.uuid() });

export type SlotRouteParams = z.infer<typeof slotRouteParamsSchema>;

const MAX_CLASSES_PER_BOOKING = 50;

/** Una clase elegida: lo justo para resumirla y apuntarse a ella. */
const chosenClassSchema = z.object({
  id: z.uuid(),
  startsAt: z.iso.datetime(),
  staffName: z.string().min(1).max(MAX_STAFF_NAME_LENGTH),
});
export type ChosenClass = z.infer<typeof chosenClassSchema>;

function parseClassesJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * Las clases elegidas: una sola (`classSessionId`, `startsAt`, `staffName`) o varias (`classes`, una
 * lista en JSON). Los parámetros de ruta no son de fiar: todo se valida y se devuelve ya como lista.
 */
export const confirmBookingRouteParamsSchema = z
  .object({
    serviceId: z.uuid(),
    classSessionId: z.uuid().optional(),
    startsAt: z.iso.datetime().optional(),
    staffName: z.string().min(1).max(MAX_STAFF_NAME_LENGTH).optional(),
    classes: z.string().optional(),
  })
  .transform((params, context) => {
    if (params.classes !== undefined) {
      const parsed = z
        .array(chosenClassSchema)
        .min(1)
        .max(MAX_CLASSES_PER_BOOKING)
        .safeParse(parseClassesJson(params.classes));
      if (parsed.success) return { serviceId: params.serviceId, classes: parsed.data };
    } else if (
      params.classSessionId !== undefined &&
      params.startsAt !== undefined &&
      params.staffName !== undefined
    ) {
      const single = {
        id: params.classSessionId,
        startsAt: params.startsAt,
        staffName: params.staffName,
      };
      return { serviceId: params.serviceId, classes: [single] };
    }
    context.addIssue({ code: 'custom', message: 'No class was chosen' });
    return z.NEVER;
  });
export type ConfirmBookingRouteParams = z.output<typeof confirmBookingRouteParamsSchema>;

export const bookedRouteParamsSchema = z.object({ bookingId: z.uuid() });

/** Cambiar la hora de una cita: lo justo para pedir los huecos del mismo servicio y persona. */
export const rescheduleRouteParamsSchema = z.object({
  bookingId: z.uuid(),
  serviceId: z.uuid(),
  staffMembershipId: z.uuid(),
  serviceName: z.string().min(1).max(MAX_STAFF_NAME_LENGTH),
  startsAt: z.iso.datetime(),
});
export type RescheduleRouteParams = z.infer<typeof rescheduleRouteParamsSchema>;
