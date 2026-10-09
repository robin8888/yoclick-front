import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { useSessionStore } from '@/shared/auth/session-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import { mockApi } from '@/test/mock-api';

import type { PendingCenter } from '../model/pending-center';
import { usePendingCenterStore } from '../model/pending-center-store';
import { useJoinPendingCenter } from './useJoinPendingCenter';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const CENTER: PendingCenter = {
  id: NORTE_CENTER_ID,
  name: 'Academia Ninja',
  sectorId: 'artes_marciales',
  brandHexColor: '#C8102E',
  logoUrl: null,
  joinCode: 'NINJA7',
  joinSource: 'qr',
};

function buildWrapper(): ({ children }: { children: ReactNode }) => React.JSX.Element {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useJoinPendingCenter', () => {
  beforeEach(() => {
    act(() => {
      useSessionStore.getState().startSession({ accessToken: 'token', user: null });
      usePendingCenterStore.getState().selectPendingCenter(CENTER);
    });
  });

  it('still makes the center the active one when the screen that asked has already closed', async () => {
    mockApi({
      [`POST /v1/join/${NORTE_CENTER_ID}`]: { membershipId: 'm1' },
      'GET /v1/me/memberships': { memberships: [] },
    });
    const onJoined = jest.fn();
    const { result, unmount } = renderHook(() => useJoinPendingCenter(), {
      wrapper: buildWrapper(),
    });

    act(() => {
      result.current.joinPendingCenter(CENTER, { onJoined });
    });
    // El login se cierra en cuanto hay sesión, antes de que el servidor conteste.
    unmount();

    await waitFor(() => {
      expect(onJoined).toHaveBeenCalledTimes(1);
    });
    expect(useSessionStore.getState().activeCenterId).toBe(NORTE_CENTER_ID);
    expect(usePendingCenterStore.getState().pendingCenter).toBeNull();
  });
});
