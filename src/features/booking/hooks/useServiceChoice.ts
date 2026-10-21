import { useState } from 'react';

import { useActiveCenterSectorId } from '@/features/join';
import type { ServiceListResponseDtoServicesItem } from '@/shared/api/generated/model';
import { hasRoomManagement } from '@/shared/i18n';

export interface ServiceChoice {
  selectedServiceId: string | null;
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
  const isScheduleRequired = hasRoomManagement(useActiveCenterSectorId());
  const [onlyService, ...others] = services ?? [];
  const isOnlyServiceBookable =
    onlyService !== undefined &&
    others.length === 0 &&
    (!isScheduleRequired || onlyService.hasSchedule);

  return {
    selectedServiceId: pickedServiceId ?? (isOnlyServiceBookable ? onlyService.id : null),
    selectService: setPickedServiceId,
  };
}
