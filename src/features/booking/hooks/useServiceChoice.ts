import { useState } from 'react';

import { useActiveCenterModules } from '@/features/join';
import type { ServiceListResponseDtoServicesItem } from '@/shared/api/generated/model';

import { getBookingMethod, type BookingMethod } from '../model/booking-method';

export interface ServiceChoice {
  selectedServiceId: string | null;
  /** Cómo se reserva el servicio elegido; `null` mientras no hay ninguno. */
  bookingMethod: BookingMethod | null;
  selectService: (serviceId: string) => void;
}

/**
 * El servicio elegido en el paso 1. Si el centro solo ofrece uno que se pueda reservar, ya viene
 * elegido: no hay nada que comparar y se ahorra un toque.
 */
export function useServiceChoice(
  services: readonly ServiceListResponseDtoServicesItem[] | undefined,
): ServiceChoice {
  const [pickedServiceId, setPickedServiceId] = useState<string | null>(null);
  const isRoomsModuleOn = useActiveCenterModules().rooms;
  const [onlyService, ...others] = services ?? [];
  const isOnlyServiceBookable =
    onlyService !== undefined &&
    others.length === 0 &&
    getBookingMethod(onlyService, { isRoomsModuleOn }) !== 'unavailable';

  const selectedServiceId = pickedServiceId ?? (isOnlyServiceBookable ? onlyService.id : null);
  const selectedService = services?.find((service) => service.id === selectedServiceId);

  return {
    selectedServiceId,
    bookingMethod:
      selectedService === undefined ? null : getBookingMethod(selectedService, { isRoomsModuleOn }),
    selectService: setPickedServiceId,
  };
}
