import { act, screen } from '@testing-library/react-native';
import { Linking } from 'react-native';

import { useSessionStore } from '@/shared/auth/session-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import { buildApiError, findApiCall, mockApi } from '@/test/mock-api';
import { resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { SubscriptionPlansScreen } from './SubscriptionPlansScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const SUBSCRIPTION_PATH = `/v1/centers/${NORTE_CENTER_ID}/subscription`;
const PLANS_PATH = `${SUBSCRIPTION_PATH}/plans`;
const CHECKOUT_PATH = `${SUBSCRIPTION_PATH}/checkout`;
const PORTAL_PATH = `${SUBSCRIPTION_PATH}/portal`;

const PRO_FEATURES = [
  'reports',
  'clientImport',
  'routines',
  'contentLibrary',
  'groups',
  'families',
  'waitlist',
  'rooms',
];

const PLAN_OFFERS = {
  plans: [
    {
      id: 'basic',
      name: 'Básico',
      monthlyPriceCents: 3900,
      annualMonthlyPriceCents: 3200,
      setupFeeCents: 0,
      maxClients: 150,
      documentStorageLimitBytes: 1_073_741_824,
      videoStorageLimitBytes: null,
      features: [],
      isAvailable: true,
    },
    {
      id: 'pro',
      name: 'Pro',
      monthlyPriceCents: 7900,
      annualMonthlyPriceCents: 6500,
      setupFeeCents: 0,
      maxClients: 500,
      documentStorageLimitBytes: 5_368_709_120,
      videoStorageLimitBytes: null,
      features: PRO_FEATURES,
      isAvailable: true,
    },
    {
      id: 'premium',
      name: 'Premium',
      monthlyPriceCents: 14900,
      annualMonthlyPriceCents: 12400,
      setupFeeCents: 29000,
      maxClients: null,
      documentStorageLimitBytes: 21_474_836_480,
      videoStorageLimitBytes: 21_474_836_480,
      features: [...PRO_FEATURES, 'customAppearance', 'videos'],
      isAvailable: true,
    },
  ],
};

const TRIAL_SUBSCRIPTION = {
  status: 'trial',
  trialEndsAt: '2026-11-05T10:00:00.000Z',
  planId: 'pro',
  billingPeriod: null,
  graceEndsAt: null,
  hasSubscription: false,
  maxClients: 500,
  activeClientCount: 20,
};

function mockPlans(subscription: object = {}): void {
  mockApi({
    'GET /v1/me/memberships': { memberships: [] },
    [`GET ${SUBSCRIPTION_PATH}`]: { ...TRIAL_SUBSCRIPTION, ...subscription },
    [`GET ${PLANS_PATH}`]: PLAN_OFFERS,
  });
}

describe('SubscriptionPlansScreen', () => {
  let openUrl: jest.SpyInstance;

  beforeEach(() => {
    resetMockRouter();
    act(() => {
      useSessionStore.getState().startSession({ accessToken: 'token', user: null });
      useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
    });
    openUrl = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    openUrl.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows the three plans with their limits', async () => {
    mockPlans();
    renderScreen(<SubscriptionPlansScreen />);

    expect(await screen.findByText('Básico')).toBeOnTheScreen();
    expect(screen.getByText('Pro')).toBeOnTheScreen();
    expect(screen.getByText('Premium')).toBeOnTheScreen();
    expect(screen.getByText('• Hasta 150 clientes activos')).toBeOnTheScreen();
    expect(screen.getByText('• Clientes ilimitados')).toBeOnTheScreen();
  });

  it('explains what each plan gives: the basics, then what each one adds to the one below', async () => {
    mockPlans();
    renderScreen(<SubscriptionPlansScreen />);

    await screen.findByText('Básico');

    expect(
      screen.getByText('• Reservas de citas y de clases, con agenda del equipo'),
    ).toBeOnTheScreen();
    expect(screen.getByText('Todo lo del plan Básico, y además:')).toBeOnTheScreen();
    expect(screen.getByText('• Informes del centro')).toBeOnTheScreen();
    expect(screen.getByText('Todo lo del plan Pro, y además:')).toBeOnTheScreen();
    expect(screen.getByText('• Vídeos de presentación del equipo')).toBeOnTheScreen();
    // Lo que da el Pro no se repite en el Premium.
    expect(screen.getAllByText('• Informes del centro')).toHaveLength(1);
  });

  it('marks the plan the center has now', async () => {
    mockPlans();
    renderScreen(<SubscriptionPlansScreen />);

    expect(await screen.findByText('Tu plan')).toBeOnTheScreen();
  });

  it('shows no prices, no billing period selector and nothing about how to pay (App Store 3.1.1)', async () => {
    mockPlans();
    renderScreen(<SubscriptionPlansScreen />);

    await screen.findByText('Básico');

    expect(screen.queryByText(/€/)).toBeNull();
    expect(screen.queryByText(/IVA/)).toBeNull();
    expect(screen.queryByText(/correo|enlace|pagar|pagas|contratar/i)).toBeNull();
    expect(screen.queryByRole('radio')).toBeNull();
  });

  it('offers no way to buy: no buttons and no calls to checkout or the Stripe portal', async () => {
    mockPlans({ status: 'active', hasSubscription: true, billingPeriod: 'monthly' });
    renderScreen(<SubscriptionPlansScreen />);

    await screen.findByText('Básico');

    expect(screen.queryByRole('button', { name: /Elegir|Gestionar/ })).toBeNull();
    expect(findApiCall('POST', CHECKOUT_PATH)).toBeUndefined();
    expect(findApiCall('POST', PORTAL_PATH)).toBeUndefined();
    expect(openUrl).not.toHaveBeenCalled();
  });

  it('offers a retry when the plans cannot be loaded', async () => {
    mockApi({
      'GET /v1/me/memberships': { memberships: [] },
      [`GET ${SUBSCRIPTION_PATH}`]: () => {
        throw buildApiError('INTERNAL_ERROR', 500);
      },
    });
    renderScreen(<SubscriptionPlansScreen />);

    expect(await screen.findByText('No hemos podido cargar los planes')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: /Reintentar/ })).toBeOnTheScreen();
  });
});
