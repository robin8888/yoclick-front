import { z } from 'zod';

// Los parámetros de ruta no son de fiar (deep links, restauración de navegación): se validan.
export const receiptRouteParamsSchema = z.object({ paymentId: z.uuid() });
