import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import { useSessionStore } from '@/shared/auth/session-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import { findApiCall, mockApi } from '@/test/mock-api';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { SetupProgressCard } from './SetupProgressCard';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const CENTER_PATH = `/v1/centers/${NORTE_CENTER_ID}`;
const JOIN_STATS = { month: '2026-10', qr: 0, link: 0, code: 0, search: 0, total: 0 };

interface CenterState {
  isConfigured: boolean;
  hasClients: boolean;
}

function mockCenter({ isConfigured, hasClients }: CenterState): void {
  mockApi({
    'GET /v1/me/memberships': { memberships: [] },
    [`GET ${CENTER_PATH}`]: {
      address: isConfigured ? 'Calle Mayor 1' : null,
      phone: isConfigured ? '600000000' : null,
      openingHours: isConfigured ? { mon: [{ from: '09:00', to: '18:00' }] } : null,
    },
    [`GET ${CENTER_PATH}/services`]: {
      services: isConfigured ? [{ id: 'service-1', name: 'Clase' }] : [],
    },
    [`GET ${CENTER_PATH}/rooms`]: { rooms: isConfigured ? [{ id: 'room-1' }] : [] },
    [`GET ${CENTER_PATH}/team`]: { members: isConfigured ? [{}, {}] : [{}] },
    [`GET ${CENTER_PATH}/join-stats`]: { ...JOIN_STATS, total: hasClients ? 3 : 0 },
  });
}

describe('SetupProgressCard', () => {
  beforeEach(() => {
    resetMockRouter();
    act(() => {
      useSessionStore.getState().startSession({ accessToken: 'token', user: null });
      useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
    });
  });

  it('shows how many steps are done and opens the next one', async () => {
    mockCenter({ isConfigured: false, hasClients: false });
    renderScreen(<SetupProgressCard />);

    const card = await screen.findByRole('button', { name: /Primeros pasos, 0 de/ });
    fireEvent.press(card);

    expect(getMockRouter().push).toHaveBeenCalledWith('/(admin)/center');
  });

  it('skips the steps that are already done', async () => {
    mockCenter({ isConfigured: true, hasClients: false });
    renderScreen(<SetupProgressCard />);

    expect(await screen.findByText(/Siguiente: Invita a tus/)).toBeOnTheScreen();
  });

  it('disappears once everything is done', async () => {
    mockCenter({ isConfigured: true, hasClients: true });
    renderScreen(<SetupProgressCard />);

    await waitFor(() => {
      expect(findApiCall('GET', `${CENTER_PATH}/join-stats`)).toBeDefined();
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.queryByRole('button', { name: /Primeros pasos/ })).toBeNull();
  });
});
