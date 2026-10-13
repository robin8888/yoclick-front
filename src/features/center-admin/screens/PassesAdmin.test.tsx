import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import { useSessionStore } from '@/shared/auth/session-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import { findApiCall, mockApi } from '@/test/mock-api';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { NewRateScreen } from './NewRateScreen';
import { PassesAdminScreen } from './PassesAdminScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const RATES_PATH = `/v1/centers/${NORTE_CENTER_ID}/rates`;
const PASSES_PATH = `/v1/centers/${NORTE_CENTER_ID}/passes`;
const SERVICES_PATH = `/v1/centers/${NORTE_CENTER_ID}/services`;
const RATE_ID = '0191d6a0-0000-7000-8000-0000000000c1';
const PASS_ID = '0191d6a0-0000-7000-8000-0000000000d1';

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

const PENDING_PASSES = {
  passes: [
    {
      id: PASS_ID,
      name: 'Bono 10 clases',
      status: 'pending',
      totalSessions: 10,
      remainingSessions: 10,
      priceCents: 5500,
      services: [],
      isRequestedByClient: true,
      requestedAt: '2026-10-10T10:00:00.000Z',
      startsAt: null,
      expiresAt: null,
      client: { membershipId: '0191d6a0-0000-7000-8000-0000000000e1', fullName: 'Lucía Gómez' },
    },
  ],
};

function signInToCenter(): void {
  act(() => {
    useSessionStore.getState().startSession({ accessToken: 'token', user: null });
    useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
  });
}

describe('PassesAdminScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    signInToCenter();
  });

  it('lists the passes for sale with what they bring and cost', async () => {
    mockApi({ [`GET ${RATES_PATH}`]: RATES, [`GET ${PASSES_PATH}`]: { passes: [] } });
    renderScreen(<PassesAdminScreen />);

    expect(await screen.findByText('Bono 10 clases')).toBeOnTheScreen();
    expect(screen.getByText('Válido 60 días')).toBeOnTheScreen();
    expect(screen.getByText('55 €')).toBeOnTheScreen();
    expect(screen.getByText('Vale para todos los servicios')).toBeOnTheScreen();
  });

  it('activates a pending pass when the center has collected it', async () => {
    mockApi({
      [`GET ${RATES_PATH}`]: RATES,
      [`GET ${PASSES_PATH}`]: PENDING_PASSES,
      [`POST ${PASSES_PATH}/${PASS_ID}/activate`]: {
        ...PENDING_PASSES.passes[0],
        status: 'active',
      },
    });
    renderScreen(<PassesAdminScreen />);

    expect(await screen.findByText('Lo ha pedido Lucía Gómez')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Marcar como cobrado' }));

    await waitFor(() => {
      expect(findApiCall('POST', `${PASSES_PATH}/${PASS_ID}/activate`)).toBeDefined();
    });
  });

  it('goes to the new pass form from the empty state', async () => {
    mockApi({ [`GET ${RATES_PATH}`]: { rates: [] }, [`GET ${PASSES_PATH}`]: { passes: [] } });
    renderScreen(<PassesAdminScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Nuevo bono' }));

    expect(getMockRouter().push).toHaveBeenCalledWith('/(admin)/passes/new');
  });
});

describe('NewRateScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    signInToCenter();
  });

  it('creates a pass with the price in cents', async () => {
    mockApi({
      [`GET ${SERVICES_PATH}`]: { services: [] },
      [`POST ${RATES_PATH}`]: { ...RATES.rates[0] },
      [`GET ${RATES_PATH}`]: RATES,
    });
    renderScreen(<NewRateScreen />);

    fireEvent.changeText(await screen.findByLabelText('Nombre del bono'), 'Bono 10 clases');
    fireEvent.changeText(screen.getByLabelText('Precio (€)'), '55,50');
    fireEvent.press(screen.getByRole('button', { name: 'Guardar bono' }));

    await waitFor(() => {
      expect(findApiCall('POST', RATES_PATH)?.body).toEqual({
        name: 'Bono 10 clases',
        sessionsCount: 10,
        validDays: 30,
        priceCents: 5550,
        serviceIds: [],
      });
    });
  });

  it('does not send a pass without a price', async () => {
    mockApi({ [`GET ${SERVICES_PATH}`]: { services: [] } });
    renderScreen(<NewRateScreen />);

    fireEvent.changeText(await screen.findByLabelText('Nombre del bono'), 'Bono 10 clases');
    fireEvent.press(screen.getByRole('button', { name: 'Guardar bono' }));

    expect(await screen.findByText('Indica un precio, por ejemplo 55 o 55,50.')).toBeOnTheScreen();
    expect(findApiCall('POST', RATES_PATH)).toBeUndefined();
  });
});
