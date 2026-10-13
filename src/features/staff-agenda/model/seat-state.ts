import { hasSessionEnded, type RoomSession } from './room-agenda';

/** El estado de una clase en la rejilla: lo que decide el borde de su ficha. */
export type SeatState = 'open' | 'full' | 'private' | 'cancelled' | 'finished';

/**
 * `open`: grupal con plazas libres (hay que llenarla); `full`: aforo completo; `private`: una
 * sola persona, sin aforo que llenar; `cancelled`: ese día no se da; `finished`: ya terminó, así
 * que ni hay plazas que llenar ni nada que hacer.
 */
export function getSeatState(session: RoomSession, now: Date): SeatState {
  if (session.cancelledReason !== null) return 'cancelled';
  if (hasSessionEnded(session, now)) return 'finished';
  if (session.mode === 'private') return 'private';
  return session.bookedCount >= session.capacity ? 'full' : 'open';
}
