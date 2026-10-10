import { i18n } from '@/shared/i18n';

export interface BookingAssigner {
  fullName: string;
  role: 'owner' | 'admin' | 'staff' | 'client';
}

/**
 * «Reservada por Marta», «Asignada por Laura (equipo)» o «Asignada por Pedro (administración)»:
 * quién puso la cita. `null` en las citas anteriores a este dato.
 */
export function describeBookingAssigner(createdBy: BookingAssigner | null): string | null {
  if (createdBy === null) return null;
  return i18n.t(`booking.assignedBy.${createdBy.role}`, { name: createdBy.fullName });
}
