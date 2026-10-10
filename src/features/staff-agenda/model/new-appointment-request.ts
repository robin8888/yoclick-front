import type {
  CreateAgendaBookingRequestDto,
  JoinGroupSessionRequestDto,
} from '@/shared/api/generated/model';

import type { AppointmentMode } from './placement-options';

interface ChosenAppointment {
  clientMembershipId: string | null;
  staffMembershipId: string | null;
  serviceId: string | null;
  startsAt: string | null;
  mode: AppointmentMode;
  /** Sala libre elegida; `null` en centros sin salas. */
  roomId: string | null;
}

/**
 * La petición lista para enviar, o `null` mientras falte algo por elegir (cliente, profesional,
 * servicio u hora). Una cita grupal necesita además sala.
 */
export function buildNewAppointmentRequest(
  chosen: ChosenAppointment,
): CreateAgendaBookingRequestDto | null {
  const { clientMembershipId, staffMembershipId, serviceId, startsAt, mode, roomId } = chosen;
  if (
    clientMembershipId === null ||
    staffMembershipId === null ||
    serviceId === null ||
    startsAt === null
  ) {
    return null;
  }
  if (mode === 'group' && roomId === null) return null;
  return {
    clientMembershipId,
    staffMembershipId,
    serviceId,
    startsAt,
    ...(mode === 'group' ? { mode } : {}),
    ...(roomId === null ? {} : { roomId }),
  };
}

/** Apuntar a un cliente a una clase grupal que ya existe; `null` mientras falte cliente o grupo. */
export function buildJoinGroupRequest(chosen: {
  clientMembershipId: string | null;
  joinSessionId: string | null;
}): JoinGroupSessionRequestDto | null {
  const { clientMembershipId, joinSessionId } = chosen;
  if (clientMembershipId === null || joinSessionId === null) return null;
  return { clientMembershipId, classSessionId: joinSessionId };
}
