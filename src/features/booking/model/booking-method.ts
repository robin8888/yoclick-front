import type { ServiceListResponseDtoServicesItem } from '@/shared/api/generated/model';

/**
 * Cómo se reserva un servicio: en una clase que el centro fijó (`class`), en una hora libre según la
 * disponibilidad de quien lo da (`hour`), o todavía no se puede (`unavailable`).
 */
export type BookingMethod = 'class' | 'hour' | 'unavailable';

type ServiceBookingFacts = Pick<
  ServiceListResponseDtoServicesItem,
  'hasSchedule' | 'mode' | 'isRental'
>;

/**
 * Con horario de sala se reserva por clase. Sin él, una cita individual se reserva por hora libre; un
 * servicio en grupo o un alquiler sin horario espera a que el centro lo fije, salvo que el centro no
 * use salas (negocios de citas): entonces todo lo que da el equipo es por hora.
 */
export function getBookingMethod(
  service: ServiceBookingFacts,
  options: { isRoomsModuleOn: boolean },
): BookingMethod {
  if (service.hasSchedule) return 'class';
  if (service.isRental) return 'unavailable';
  if (!options.isRoomsModuleOn || service.mode === 'private') return 'hour';
  return 'unavailable';
}
