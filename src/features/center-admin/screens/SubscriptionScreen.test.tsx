import { act, screen } from '@testing-library/react-native';

import { useSessionStore } from '@/shared/auth/session-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import { mockApi } from '@/test/mock-api';
import { renderScreen } from '@/test/render-screen';

import { SubscriptionScreen } from './SubscriptionScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const SUBSCRIPTION_PATH = `/v1/centers/${NORTE_CENTER_ID}/subscription`;
const MILLISECONDS_PER_DAY = 86_400_000;

function mockSubscription(overrides: object): void {
  mockApi({
    'GET /v1/me/memberships': { memberships: [] },
    [`GET ${SUBSCRIPTION_PATH}`]: {
      status: 'active',
      trialEndsAt: null,
      maxClients: 500,
      activeClientCount: 212,
      ...overrides,
    },
  });
}

describe('SubscriptionScreen', () => {
  beforeEach(() => {
    act(() => {
      useSessionStore.getState().startSession({ accessToken: 'token', user: null });
      useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
    });
  });

  it('shows the plan, its status and how much of the client limit is used', async () => {
    mockSubscription({});
    renderScreen(<SubscriptionScreen />);

    expect(await screen.findByText('Pro')).toBeOnTheScreen();
    expect(screen.getByText('Activo')).toBeOnTheScreen();
    expect(screen.getByText('212 de 500')).toBeOnTheScreen();
    expect(screen.getByText(/se gestiona y se paga en la web/)).toBeOnTheScreen();
  });

  it('counts the days left of the free trial', async () => {
    const trialEndsAt = new Date(Date.now() + 10 * MILLISECONDS_PER_DAY).toISOString();
    mockSubscription({ status: 'trial', trialEndsAt, maxClients: 150 });
    renderScreen(<SubscriptionScreen />);

    expect(await screen.findByText('Básico')).toBeOnTheScreen();
    expect(screen.getByText('Prueba gratuita')).toBeOnTheScreen();
    expect(screen.getByText('Te quedan 10 días de prueba gratuita.')).toBeOnTheScreen();
  });

  it('warns when there are more active clients than the plan allows', async () => {
    mockSubscription({ maxClients: 150, activeClientCount: 212 });
    renderScreen(<SubscriptionScreen />);

    expect(await screen.findByText(/Has superado el límite de tu plan/)).toBeOnTheScreen();
  });

  it('says there is no limit on the premium plan', async () => {
    mockSubscription({ maxClients: null });
    renderScreen(<SubscriptionScreen />);

    expect(await screen.findByText('Premium')).toBeOnTheScreen();
    expect(screen.getByText('212 · sin límite')).toBeOnTheScreen();
  });

  it('warns about a pending payment', async () => {
    mockSubscription({ status: 'past_due' });
    renderScreen(<SubscriptionScreen />);

    expect(await screen.findByText('Pago pendiente')).toBeOnTheScreen();
    expect(screen.getByText(/Hay un pago pendiente/)).toBeOnTheScreen();
  });

  it('shows an error when the plan cannot be loaded', async () => {
    mockApi({ 'GET /v1/me/memberships': { memberships: [] } });
    renderScreen(<SubscriptionScreen />);

    expect(await screen.findByText('No hemos podido cargar tu suscripción')).toBeOnTheScreen();
  });
});
