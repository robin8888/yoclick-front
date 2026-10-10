import type { ServiceListResponseDtoServicesItem } from '@/shared/api/generated/model';

/** Los servicios que da una persona del equipo; sin persona elegida, ninguno. */
export function listServicesOfStaff(
  services: readonly ServiceListResponseDtoServicesItem[],
  staffMembershipId: string | null,
): ServiceListResponseDtoServicesItem[] {
  if (staffMembershipId === null) return [];
  return services.filter((service) =>
    service.staff.some((member) => member.membershipId === staffMembershipId),
  );
}

interface ServiceChoiceFacts {
  /** Todos los servicios del centro. */
  allServices: readonly ServiceListResponseDtoServicesItem[];
  /** Los que da la persona elegida. */
  staffServices: readonly ServiceListResponseDtoServicesItem[];
  chosenServiceId: string | null;
}

/**
 * El servicio de la cita: el elegido (de cualquiera del centro, para poder avisar si esa persona no
 * lo da); si no hay elegido y la persona da uno solo, ese; si no, ninguno todavía.
 */
export function resolveServiceId({
  allServices,
  staffServices,
  chosenServiceId,
}: ServiceChoiceFacts): string | null {
  const chosenService = allServices.find((service) => service.id === chosenServiceId);
  if (chosenService !== undefined) return chosenService.id;
  return staffServices.length === 1 ? (staffServices[0]?.id ?? null) : null;
}
