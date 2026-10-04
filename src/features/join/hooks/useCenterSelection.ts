import { useRouter } from 'expo-router';

import type { CenterSearchResponseDtoCentersItem } from '@/shared/api/generated/model';

import { mapSearchResultToPendingCenter } from '../model/pending-center';
import { usePendingCenterStore } from '../model/pending-center-store';

/** Elegir un centro de la búsqueda lo deja como centro elegido y pasa a confirmarlo. */
export function useCenterSelection(): (center: CenterSearchResponseDtoCentersItem) => void {
  const router = useRouter();
  const selectPendingCenter = usePendingCenterStore((state) => state.selectPendingCenter);

  return (center) => {
    selectPendingCenter(mapSearchResultToPendingCenter(center));
    router.push(`/join/${center.id}`);
  };
}
