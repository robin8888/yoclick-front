import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import { useSessionStore } from '@/shared/auth/session-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import { findApiCall, getRecordedApiCalls, mockApi } from '@/test/mock-api';
import { renderScreen } from '@/test/render-screen';

import { ClientPassesSection } from './ClientPassesSection';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const PASSES_PATH = `/v1/centers/${NORTE_CENTER_ID}/passes`;
const RATES_PATH = `/v1/centers/${NORTE_CENTER_ID}/rates`;
const CLIENT_ID = '0191d6a0-0000-7000-8000-0000000000e1';
const RATE_ID = '0191d6a0-0000-7000-8000-0000000000c1';

const RATES = {
  rates: [
    {
      id: RATE_ID,
      name: 'Bono 10 clases',
      sessionsCount: 10,
      validDays: 60,
      priceCents: 5500,
      services: [],
    },
  ],
};

describe('ClientPassesSection', () => {
  beforeEach(() => {
    act(() => {
      useSessionStore.getState().startSession({ accessToken: 'token', user: null });
      useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
    });
  });

  it('only assigns the pass after choosing it and confirming, and only once', async () => {
    mockApi({
      [`GET ${PASSES_PATH}`]: { passes: [] },
      [`GET ${RATES_PATH}`]: RATES,
      [`POST ${PASSES_PATH}/assign`]: {},
    });
    renderScreen(<ClientPassesSection clientMembershipId={CLIENT_ID} />);

    expect(await screen.findByText('Esta persona aún no tiene bonos.')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Dar un bono' }));
    fireEvent.press(await screen.findByText('Bono 10 clases'));
    expect(findApiCall('POST', `${PASSES_PATH}/assign`)).toBeUndefined();
    expect(screen.getByRole('button', { name: 'Asignar bono' })).toBeEnabled();
    fireEvent.press(screen.getByRole('button', { name: 'Asignar bono' }));
    fireEvent.press(screen.getByRole('button', { name: 'Asignar bono' }));

    await waitFor(() => {
      expect(findApiCall('POST', `${PASSES_PATH}/assign`)?.body).toEqual({
        rateId: RATE_ID,
        clientMembershipId: CLIENT_ID,
      });
    });
    expect(
      getRecordedApiCalls().filter(
        (call) => call.method === 'POST' && call.path.endsWith('/passes/assign'),
      ),
    ).toHaveLength(1);
  });

  it('cannot assign until a pass is chosen', async () => {
    mockApi({ [`GET ${PASSES_PATH}`]: { passes: [] }, [`GET ${RATES_PATH}`]: RATES });
    renderScreen(<ClientPassesSection clientMembershipId={CLIENT_ID} />);

    fireEvent.press(await screen.findByRole('button', { name: 'Dar un bono' }));

    expect(await screen.findByRole('button', { name: 'Asignar bono' })).toBeDisabled();
  });

  it('removes an assigned pass after confirming', async () => {
    const PASS_ID = '0191d6a0-0000-7000-8000-0000000000d9';
    mockApi({
      [`GET ${PASSES_PATH}`]: {
        passes: [
          {
            id: PASS_ID,
            name: 'Bono 10 clases',
            status: 'active',
            totalSessions: 10,
            remainingSessions: 10,
            priceCents: 5500,
            services: [],
            isRequestedByClient: false,
            requestedAt: '2026-10-10T10:00:00.000Z',
            startsAt: '2026-10-10T10:00:00.000Z',
            expiresAt: '2026-12-10T10:00:00.000Z',
            client: { membershipId: CLIENT_ID, fullName: 'Alumno Seis' },
          },
        ],
      },
      [`GET ${RATES_PATH}`]: RATES,
      [`DELETE ${PASSES_PATH}/${PASS_ID}`]: undefined,
    });
    renderScreen(<ClientPassesSection clientMembershipId={CLIENT_ID} />);

    fireEvent.press(await screen.findByRole('button', { name: 'Quitar el bono Bono 10 clases' }));
    expect(await screen.findByText('¿Quitar este bono?')).toBeOnTheScreen();
    expect(findApiCall('DELETE', `${PASSES_PATH}/${PASS_ID}`)).toBeUndefined();
    fireEvent.press(screen.getByRole('button', { name: 'Sí, quitar bono' }));

    await waitFor(() => {
      expect(findApiCall('DELETE', `${PASSES_PATH}/${PASS_ID}`)).toBeDefined();
    });
  });
});
