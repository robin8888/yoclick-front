import { useState } from 'react';

import type { ClientStatusFilterId } from '../model/client-display';

interface ClientFilters {
  searchText: string;
  statusFilter: ClientStatusFilterId;
  /** Hay búsqueda o filtro: la lista dice «nadie coincide» en lugar de «aún no tienes». */
  isFiltered: boolean;
  changeSearchText: (searchText: string) => void;
  changeStatusFilter: (statusFilter: ClientStatusFilterId) => void;
}

/** Lo que se ha escrito en el buscador y el estado elegido; la lista lo pide al servidor. */
export function useClientFilters(): ClientFilters {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClientStatusFilterId>('all');

  return {
    searchText,
    statusFilter,
    isFiltered: searchText.trim() !== '' || statusFilter !== 'all',
    changeSearchText: setSearchText,
    changeStatusFilter: setStatusFilter,
  };
}
