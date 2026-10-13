import type {
  RoomListResponseDtoRoomsItem,
  ServiceListResponseDtoServicesItem,
} from '@/shared/api/generated/model';

import { listAllowedModes, listCompatibleRooms, type ScheduleMode } from '../model/schedule-form';
import type { AssignableStaffMember } from '../model/service-staff';
import { useAssignableStaff } from './useAssignableStaff';
import { useRoomList } from './useRoomList';
import { useServiceCatalog } from './useServiceCatalog';

/**
 * Los profesores entre los que el centro puede elegir: los que dan ese servicio. Un servicio sin
 * ningún profesor asignado admite a todo el equipo.
 */
function listTeachersOfService(
  team: AssignableStaffMember[],
  service: ServiceListResponseDtoServicesItem | undefined,
): AssignableStaffMember[] {
  if (service === undefined || service.staff.length === 0) return team;
  const teacherIds = new Set(service.staff.map((teacher) => teacher.membershipId));
  return team.filter((member) => teacherIds.has(member.membershipId));
}

export interface ScheduleFormOptions {
  services: ServiceListResponseDtoServicesItem[];
  rooms: RoomListResponseDtoRoomsItem[];
  /** Los espacios que admiten el servicio elegido. */
  compatibleRooms: RoomListResponseDtoRoomsItem[];
  selectedRoom: RoomListResponseDtoRoomsItem | undefined;
  staffMembers: AssignableStaffMember[];
  allowedModes: ScheduleMode[];
}

interface ScheduleChoice {
  serviceId: string;
  roomId: string;
}

/** Lo que se puede elegir en un horario: servicios, espacios compatibles, profesores y modos. */
export function useScheduleFormOptions(choice: ScheduleChoice): ScheduleFormOptions {
  const services = useServiceCatalog().data?.services ?? [];
  const rooms = useRoomList().data?.rooms ?? [];
  const staff = useAssignableStaff();
  const selectedService = services.find((service) => service.id === choice.serviceId);
  const compatibleRooms = listCompatibleRooms(rooms, choice.serviceId);

  return {
    services,
    rooms,
    compatibleRooms,
    selectedRoom: compatibleRooms.find((room) => room.id === choice.roomId),
    staffMembers: listTeachersOfService(staff.members, selectedService),
    allowedModes: listAllowedModes(selectedService?.mode),
  };
}
