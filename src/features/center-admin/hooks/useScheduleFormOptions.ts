import type {
  RoomListResponseDtoRoomsItem,
  ServiceListResponseDtoServicesItem,
} from '@/shared/api/generated/model';

import { listAllowedModes, listCompatibleRooms, type ScheduleMode } from '../model/schedule-form';
import type { AssignableStaffMember } from '../model/service-staff';
import { useAssignableStaff } from './useAssignableStaff';
import { useRoomList } from './useRoomList';
import { useServiceCatalog } from './useServiceCatalog';

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
    staffMembers: staff.members,
    allowedModes: listAllowedModes(selectedService?.mode),
  };
}
