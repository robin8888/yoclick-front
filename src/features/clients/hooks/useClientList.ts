import {
  useInfiniteQuery,
  type InfiniteData,
  type UseInfiniteQueryResult,
} from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import {
  clientsList,
  getClientsListQueryKey,
} from '@/shared/api/generated/endpoints/clients/clients';
import type { ClientListResponseDto, ClientsListParams } from '@/shared/api/generated/model';
import { useSessionStore } from '@/shared/auth/session-store';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';

import { toStatusParam, type ClientStatusFilterId } from '../model/client-display';

const CLIENT_PAGE_SIZE = 50;
const SEARCH_DEBOUNCE_MS = 300;

interface ClientListRequest {
  searchText: string;
  statusFilter: ClientStatusFilterId;
  /** Solo las personas de este grupo. */
  groupId?: string;
  /** El personal ve por defecto solo a quienes han reservado con él; `center` los trae a todos. */
  scope?: 'mine' | 'center';
}

export interface ClientListPages {
  /** Todos los clientes del centro (la cifra de «Alumnos (212)»), sin filtros. */
  totalClientCount: number;
  matchingCount: number;
  clients: ClientListResponseDto['clients'];
}

type ClientListQuery = UseInfiniteQueryResult<InfiniteData<ClientListPages>, ErrorType>;

function buildParams(request: ClientListRequest, search: string): ClientsListParams {
  const status = toStatusParam(request.statusFilter);
  return {
    ...(search === '' ? {} : { search }),
    ...(status === undefined ? {} : { status }),
    ...(request.groupId === undefined ? {} : { groupId: request.groupId }),
    ...(request.scope === undefined ? {} : { scope: request.scope }),
  };
}

/** Los clientes del centro por páginas, con búsqueda por nombre y filtro por estado. */
export function useClientList(request: ClientListRequest): ClientListQuery {
  const centerId = useSessionStore((state) => state.activeCenterId);
  const search = useDebouncedValue(request.searchText.trim(), SEARCH_DEBOUNCE_MS);
  const params = buildParams(request, search);

  return useInfiniteQuery({
    queryKey: [...getClientsListQueryKey(centerId ?? '', params), 'pages'],
    enabled: centerId !== null,
    initialPageParam: 0,
    queryFn: async ({ pageParam }): Promise<ClientListPages> =>
      clientsList(centerId ?? '', { ...params, limit: CLIENT_PAGE_SIZE, offset: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.reduce((total, page) => total + page.clients.length, 0);
      return loadedCount < lastPage.matchingCount ? loadedCount : undefined;
    },
  });
}
