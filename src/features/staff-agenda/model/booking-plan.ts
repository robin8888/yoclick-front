import type {
  BookingResponseDto,
  CreateAgendaBookingRequestDto,
  JoinGroupSessionRequestDto,
} from '@/shared/api/generated/model';

import { buildNewAppointmentRequest } from './new-appointment-request';
import type { AppointmentMode } from './placement-options';

type CreateTemplate = Omit<CreateAgendaBookingRequestDto, 'clientMembershipId'>;

/**
 * Lo que hay que hacer al guardar: a quiénes apuntar y a qué. Con `joinSessionId` la clase ya
 * existe y se apunta a todos; con `createTemplate` la cita se crea con la primera persona y las
 * demás se apuntan a la clase recién creada.
 */
export interface BookingPlan {
  clientMembershipIds: readonly string[];
  joinSessionId: string | null;
  createTemplate: CreateTemplate | null;
}

interface PlannedAppointment {
  clientMembershipIds: readonly string[];
  staffMembershipId: string | null;
  serviceId: string | null;
  startsAt: string | null;
  mode: AppointmentMode;
  roomId: string | null;
  /** La clase grupal que ya existe a la que se apunta; `null` si se crea una cita nueva. */
  joinSessionId: string | null;
}

/** El plan listo para ejecutar, o `null` mientras falte a quién apuntar o algo por elegir. */
export function buildBookingPlan(planned: PlannedAppointment): BookingPlan | null {
  const { clientMembershipIds, joinSessionId, ...chosen } = planned;
  const [firstClientId] = clientMembershipIds;
  if (firstClientId === undefined) return null;
  if (joinSessionId !== null) {
    return { clientMembershipIds, joinSessionId, createTemplate: null };
  }
  const request = buildNewAppointmentRequest({ ...chosen, clientMembershipId: firstClientId });
  if (request === null) return null;
  const createTemplate: CreateTemplate = {
    serviceId: request.serviceId,
    ...(request.staffMembershipId === undefined
      ? {}
      : { staffMembershipId: request.staffMembershipId }),
    startsAt: request.startsAt,
    ...(request.mode === undefined ? {} : { mode: request.mode }),
    ...(request.roomId === undefined ? {} : { roomId: request.roomId }),
  };
  return { clientMembershipIds, joinSessionId: null, createTemplate };
}

export interface BookingPlanApi {
  createBooking: (request: CreateAgendaBookingRequestDto) => Promise<BookingResponseDto>;
  joinGroup: (request: JoinGroupSessionRequestDto) => Promise<unknown>;
}

export interface BookingPlanOutcome {
  /** A quiénes no se pudo apuntar; vacío si todo fue bien. */
  failedClientMembershipIds: string[];
  /** El primer error recibido, para explicar por qué; `null` si todo fue bien. */
  firstError: unknown;
}

/**
 * Ejecuta el plan de uno en uno, sin optimismo. Si falla crear la cita no se apunta a nadie; si
 * falla apuntar a alguien se sigue con los demás y se cuenta quién se quedó fuera.
 */
export async function executeBookingPlan(
  plan: BookingPlan,
  api: BookingPlanApi,
): Promise<BookingPlanOutcome> {
  let classSessionId = plan.joinSessionId;
  let pendingClientIds = [...plan.clientMembershipIds];

  if (classSessionId === null && plan.createTemplate !== null) {
    const [firstClientId = '', ...otherClientIds] = pendingClientIds;
    try {
      const booking = await api.createBooking({
        ...plan.createTemplate,
        clientMembershipId: firstClientId,
      });
      classSessionId = booking.session.id;
      pendingClientIds = otherClientIds;
    } catch (error) {
      return { failedClientMembershipIds: [...plan.clientMembershipIds], firstError: error };
    }
  }

  const outcome: BookingPlanOutcome = { failedClientMembershipIds: [], firstError: null };
  for (const clientMembershipId of pendingClientIds) {
    try {
      await api.joinGroup({ clientMembershipId, classSessionId: classSessionId ?? '' });
    } catch (error) {
      outcome.failedClientMembershipIds.push(clientMembershipId);
      outcome.firstError ??= error;
    }
  }
  return outcome;
}
