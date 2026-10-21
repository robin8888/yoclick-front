import { useState } from 'react';

import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';

import type { CenterStatusFilter } from '../components/CenterFilters';
import { usePlatformCenters } from './usePlatformCenters';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 400;

type CentersQuery = ReturnType<typeof usePlatformCenters>;

interface CenterSearch {
  searchText: string;
  setSearchText: (nextText: string) => void;
  status: CenterStatusFilter;
  setStatus: (nextStatus: CenterStatusFilter) => void;
  clearFilters: () => void;
  centers: CentersQuery;
}

/** El texto buscado y el estado elegido, y los centros que el servidor devuelve para ese filtro. */
export function useCenterSearch(): CenterSearch {
  const [searchText, setSearchText] = useState('');
  const [status, setStatus] = useState<CenterStatusFilter>('all');
  const search = useDebouncedValue(searchText.trim(), SEARCH_DEBOUNCE_MS);
  const centers = usePlatformCenters({
    limit: PAGE_SIZE,
    ...(status === 'all' ? {} : { status }),
    ...(search === '' ? {} : { search }),
  });

  return {
    searchText,
    setSearchText,
    status,
    setStatus,
    clearFilters: () => {
      setSearchText('');
      setStatus('all');
    },
    centers,
  };
}
