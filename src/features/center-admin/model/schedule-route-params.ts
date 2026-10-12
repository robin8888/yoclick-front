import { z } from 'zod';

/** `/(admin)/schedules/[seriesId]` y sus pantallas hijas. */
export const scheduleRouteParamsSchema = z.object({ seriesId: z.string().min(1) });
