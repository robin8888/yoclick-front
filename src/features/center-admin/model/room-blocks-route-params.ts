import { z } from 'zod';

/** `/(admin)/room-blocks/[roomId]` y la pantalla de bloqueo nuevo. */
export const roomBlocksRouteParamsSchema = z.object({ roomId: z.string().min(1) });
