import { act, fireEvent, screen } from '@testing-library/react-native';

import { useSessionStore } from '@/shared/auth/session-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import { mockApi } from '@/test/mock-api';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
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
      planId: 'pro',
      billingPeriod: null,
      graceEndsAt: null,
      hasSubscription: false,
      maxClients: 500,
      activeClientCount: 212,
      ...overrides,
    },
  });
}

describe('SubscriptionScreen', () => {
  beforeEach(() => {
    resetMockRouter();
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
    expect(screen.getByRole('button', { name: 'Elegir plan' })).toBeOnTheScreen();
  });

  it('counts the days left of the free trial', async () => {
    const trialEndsAt = new Date(Date.now() + 10 * MILLISECONDS_PER_DAY).toISOString();
    mockSubscription({ status: 'trial', trialEndsAt, planId: 'basic', maxClients: 150 });
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
    mockSubscription({ planId: 'premium', maxClients: null });
    renderScreen(<SubscriptionScreen />);

    expect(await screen.findByText('Premium')).toBeOnTheScreen();
    expect(screen.getByText('212 · sin límite')).toBeOnTheScreen();
  });

  it('warns about a pending payment', async () => {
    mockSubscription({ status: 'past_due', graceEndsAt: '2026-11-03T10:00:00.000Z' });
    renderScreen(<SubscriptionScreen />);

    expect(await screen.findByText('Pago pendiente')).toBeOnTheScreen();
    expect(screen.getByText(/Ha fallado el último pago.*Tienes hasta el/)).toBeOnTheScreen();
  });

  it('tells a suspended center to choose a plan to reactivate', async () => {
    mockSubscription({ status: 'suspended' });
    renderScreen(<SubscriptionScreen />);

    expect(await screen.findByText(/suspendido por falta de pago/)).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Elegir plan' })).toBeOnTheScreen();
  });

  it('says how often a paying center is charged and offers no plan button', async () => {
    mockSubscription({ billingPeriod: 'annual', hasSubscription: true });
    renderScreen(<SubscriptionScreen />);

    expect(await screen.findByText('Pagas una vez al año.')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Elegir plan' })).toBeNull();
    expect(screen.getByText(/se renueva sola/)).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Gestionar suscripción' })).toBeOnTheScreen();
  });

  it('opens the plans to choose from', async () => {
    mockSubscription({ status: 'trial', trialEndsAt: null });
    renderScreen(<SubscriptionScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Elegir plan' }));

    expect(getMockRouter().push).toHaveBeenCalledWith('/(admin)/subscription/plans');
  });

  it('shows an error when the plan cannot be loaded', async () => {
    mockApi({ 'GET /v1/me/memberships': { memberships: [] } });
    renderScreen(<SubscriptionScreen />);

    expect(await screen.findByText('No hemos podido cargar tu suscripción')).toBeOnTheScreen();
  });
});
