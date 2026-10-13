import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import { useSessionStore } from '@/shared/auth/session-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import { findApiCall, mockApi } from '@/test/mock-api';
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

  it('gives the person an active pass chosen from the center passes', async () => {
    mockApi({
      [`GET ${PASSES_PATH}`]: { passes: [] },
      [`GET ${RATES_PATH}`]: RATES,
      [`POST ${PASSES_PATH}/assign`]: {},
    });
    renderScreen(<ClientPassesSection clientMembershipId={CLIENT_ID} />);

    expect(await screen.findByText('Esta persona aún no tiene bonos.')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Dar un bono' }));
    fireEvent.press(await screen.findByText('Bono 10 clases'));

    await waitFor(() => {
      expect(findApiCall('POST', `${PASSES_PATH}/assign`)?.body).toEqual({
        rateId: RATE_ID,
        clientMembershipId: CLIENT_ID,
      });
    });
  });
});
