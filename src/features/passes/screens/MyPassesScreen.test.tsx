import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import { useSessionStore } from '@/shared/auth/session-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import { findApiCall, mockApi } from '@/test/mock-api';
import { resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { MyPassesScreen } from './MyPassesScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const MINE_PATH = `/v1/centers/${NORTE_CENTER_ID}/passes/mine`;
const RATES_PATH = `/v1/centers/${NORTE_CENTER_ID}/rates`;
const RATE_ID = '0191d6a0-0000-7000-8000-0000000000c1';
const KARATE = { id: '0191d6a0-0000-7000-8000-0000000000a1', name: 'Kárate' };

const ACTIVE_PASS = {
  id: '0191d6a0-0000-7000-8000-0000000000d1',
  name: 'Bono 10 clases',
  status: 'active',
  totalSessions: 10,
  remainingSessions: 6,
  priceCents: 5500,
  services: [KARATE],
  isRequestedByClient: true,
  requestedAt: '2026-10-01T10:00:00.000Z',
  startsAt: '2026-10-02T10:00:00.000Z',
  expiresAt: '2026-12-01T10:00:00.000Z',
  client: { membershipId: '0191d6a0-0000-7000-8000-0000000000e1', fullName: 'Lucía Gómez' },
};

const RATES = {
  rates: [
    {
      id: RATE_ID,
      name: 'Bono 20 clases',
      sessionsCount: 20,
      validDays: 90,
      priceCents: 9000,
      services: [],
    },
  ],
};

describe('MyPassesScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    act(() => {
      useSessionStore.getState().startSession({ accessToken: 'token', user: null });
      useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
    });
  });

  it('shows how many classes are left, with the state as a word', async () => {
    mockApi({ [`GET ${MINE_PATH}`]: { passes: [ACTIVE_PASS] }, [`GET ${RATES_PATH}`]: RATES });
    renderScreen(<MyPassesScreen />);

    expect(await screen.findByText('Bono 10 clases')).toBeOnTheScreen();
    expect(screen.getAllByText('6')).toHaveLength(2);
    expect(screen.getByText('de 10 clases')).toBeOnTheScreen();
    expect(screen.getByText('Activo')).toBeOnTheScreen();
    expect(screen.getByText('Kárate')).toBeOnTheScreen();
  });

  it('asks the center for a pass and says it is pending', async () => {
    mockApi({
      [`GET ${MINE_PATH}`]: { passes: [] },
      [`GET ${RATES_PATH}`]: RATES,
      [`POST ${RATES_PATH}/${RATE_ID}/request`]: {
        ...ACTIVE_PASS,
        status: 'pending',
        expiresAt: null,
      },
    });
    renderScreen(<MyPassesScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Pedir el bono Bono 20 clases' }));

    await waitFor(() => {
      expect(findApiCall('POST', `${RATES_PATH}/${RATE_ID}/request`)).toBeDefined();
    });
  });

  it('tells the person when there is no pass yet', async () => {
    mockApi({ [`GET ${MINE_PATH}`]: { passes: [] }, [`GET ${RATES_PATH}`]: { rates: [] } });
    renderScreen(<MyPassesScreen />);

    expect(await screen.findByText('Todavía no tienes ningún bono.')).toBeOnTheScreen();
    expect(screen.getByText('Tu centro aún no ofrece bonos.')).toBeOnTheScreen();
  });
});
