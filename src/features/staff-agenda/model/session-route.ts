interface ClassSessionRouteRequest {
  bookingId: string;
  /** `YYYY-MM-DD` del día en el que se abre la clase. */
  date: string;
  /** La abre el centro: su grupo de rutas es otro y puede apuntar a más gente. */
  isCenterWide: boolean;
}

type ClassSessionRoute =
  | {
      pathname: '/(admin)/sessions/[bookingId]';
      params: { bookingId: string; date: string; isCenterWide: 'true' };
    }
  | { pathname: '/(staff)/sessions/[bookingId]'; params: { bookingId: string; date: string } };

/**
 * El detalle de una clase o cita. Cada rol tiene su grupo de rutas y la guarda de uno manda al
 * otro al inicio, así que el centro no puede abrir la ruta del profesional.
 */
export function buildClassSessionRoute({
  bookingId,
  date,
  isCenterWide,
}: ClassSessionRouteRequest): ClassSessionRoute {
  if (isCenterWide) {
    return {
      pathname: '/(admin)/sessions/[bookingId]',
      params: { bookingId, date, isCenterWide: 'true' },
    };
  }
  return { pathname: '/(staff)/sessions/[bookingId]', params: { bookingId, date } };
}
