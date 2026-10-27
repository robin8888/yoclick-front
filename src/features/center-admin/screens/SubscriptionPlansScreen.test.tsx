import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
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
const PORTAL_URL = 'https://billing.stripe.com/p/session/test_1';
const CHECKOUT_URL = 'https://checkout.stripe.com/c/pay/cs_test_1';

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
      features: [
        'reports',
        'clientImport',
        'routines',
        'contentLibrary',
        'groups',
        'families',
        'waitlist',
        'rooms',
      ],
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
      features: [
        'reports',
        'clientImport',
        'routines',
        'contentLibrary',
        'groups',
        'families',
        'waitlist',
        'rooms',
        'customAppearance',
        'videos',
      ],
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

function mockPlans(subscription: object = {}, plans: object = PLAN_OFFERS): void {
  mockApi({
    'GET /v1/me/memberships': { memberships: [] },
    [`GET ${SUBSCRIPTION_PATH}`]: { ...TRIAL_SUBSCRIPTION, ...subscription },
    [`GET ${PLANS_PATH}`]: plans,
    [`POST ${CHECKOUT_PATH}`]: { url: CHECKOUT_URL },
    [`POST ${PORTAL_PATH}`]: { url: PORTAL_URL },
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

  it('shows the three plans with the monthly price and what each includes', async () => {
    mockPlans();
    renderScreen(<SubscriptionPlansScreen />);

    expect(await screen.findByText('Básico')).toBeOnTheScreen();
    expect(screen.getByText(/^39.€ al mes$/)).toBeOnTheScreen();
    expect(screen.getByText(/^79.€ al mes$/)).toBeOnTheScreen();
    expect(screen.getByText(/^149.€ al mes$/)).toBeOnTheScreen();
    expect(screen.getByText('• Hasta 150 clientes activos')).toBeOnTheScreen();
    expect(screen.getByText('• Clientes ilimitados')).toBeOnTheScreen();
    expect(screen.getByText(/Cuota de alta de 290.€, una sola vez/)).toBeOnTheScreen();
    expect(screen.getAllByText('Se cobra cada mes')).toHaveLength(3);
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

  it('shows the cheaper annual price per month and the whole year charge', async () => {
    mockPlans();
    renderScreen(<SubscriptionPlansScreen />);

    fireEvent.press(await screen.findByRole('radio', { name: /Anual · ahorra hasta el 18 %/ }));

    expect(screen.getByText(/^65.€ al mes$/)).toBeOnTheScreen();
    expect(screen.getByText(/^780.€ al año, en un solo pago$/)).toBeOnTheScreen();
    expect(screen.getByText(/^124.€ al mes$/)).toBeOnTheScreen();
  });

  it('marks the plan the center has now', async () => {
    mockPlans();
    renderScreen(<SubscriptionPlansScreen />);

    expect(await screen.findByText('Tu plan')).toBeOnTheScreen();
  });

  it('opens Stripe in the browser with the plan and the period chosen', async () => {
    mockPlans();
    renderScreen(<SubscriptionPlansScreen />);

    fireEvent.press(await screen.findByRole('radio', { name: /Anual/ }));
    fireEvent.press(
      screen.getByRole('button', { name: 'Elegir el plan Premium con pago una vez al año' }),
    );

    await waitFor(() => {
      expect(openUrl).toHaveBeenCalledWith(CHECKOUT_URL);
    });
    expect(findApiCall('POST', CHECKOUT_PATH)?.body).toEqual({
      planId: 'premium',
      period: 'annual',
    });
  });

  it('starts on the period the center already pays', async () => {
    mockPlans({ status: 'past_due', billingPeriod: 'annual', planId: 'basic' });
    renderScreen(<SubscriptionPlansScreen />);

    expect(await screen.findByText(/^32.€ al mes$/)).toBeOnTheScreen();
  });

  it('does not offer to buy again the plan and period already paid', async () => {
    mockPlans({ status: 'past_due', billingPeriod: 'monthly', planId: 'pro' });
    renderScreen(<SubscriptionPlansScreen />);

    const proButton = await screen.findByRole('button', {
      name: 'Elegir el plan Pro con pago mes a mes',
    });

    expect(proButton).toBeDisabled();
  });

  it('does not let a center with an active subscription start another checkout', async () => {
    mockPlans({ status: 'active', hasSubscription: true, billingPeriod: 'monthly' });
    renderScreen(<SubscriptionPlansScreen />);

    const basicButton = await screen.findByRole('button', {
      name: 'Elegir el plan Básico con pago mes a mes',
    });

    expect(basicButton).toBeDisabled();
    expect(screen.getByText(/usa «Gestionar suscripción»/)).toBeOnTheScreen();
  });

  it('sends a center that already pays to the Stripe portal to change plan', async () => {
    mockPlans({ status: 'active', hasSubscription: true, billingPeriod: 'monthly' });
    renderScreen(<SubscriptionPlansScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Gestionar suscripción' }));

    await waitFor(() => {
      expect(openUrl).toHaveBeenCalledWith(PORTAL_URL);
    });
    expect(findApiCall('POST', PORTAL_PATH)).toBeDefined();
  });

  it('does not show the portal button to a center that is still choosing a plan', async () => {
    mockPlans();
    renderScreen(<SubscriptionPlansScreen />);

    await screen.findByText('Básico');

    expect(screen.queryByRole('button', { name: 'Gestionar suscripción' })).toBeNull();
  });

  it('says a plan is not available yet instead of offering a button', async () => {
    const plans = {
      plans: PLAN_OFFERS.plans.map((plan) => ({ ...plan, isAvailable: plan.id !== 'premium' })),
    };
    mockPlans({}, plans);
    renderScreen(<SubscriptionPlansScreen />);

    expect(await screen.findByText('Todavía no disponible')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: /Elegir el plan Premium/ })).toBeNull();
  });

  it('explains the price has no VAT and the payment happens in the browser', async () => {
    mockPlans();
    renderScreen(<SubscriptionPlansScreen />);

    expect(await screen.findByText(/Importes sin IVA/)).toBeOnTheScreen();
    expect(
      screen.getByText(/página segura de Stripe que se abre en tu navegador/),
    ).toBeOnTheScreen();
  });

  it('explains when the payment page could not be opened', async () => {
    mockPlans();
    openUrl.mockRejectedValue(new Error('no browser'));
    renderScreen(<SubscriptionPlansScreen />);

    fireEvent.press(
      await screen.findByRole('button', { name: 'Elegir el plan Básico con pago mes a mes' }),
    );

    expect(await screen.findByText(/No hemos podido abrir la página de pago/)).toBeOnTheScreen();
  });

  it('does not open the browser when the API refuses the checkout', async () => {
    mockApi({
      'GET /v1/me/memberships': { memberships: [] },
      [`GET ${SUBSCRIPTION_PATH}`]: TRIAL_SUBSCRIPTION,
      [`GET ${PLANS_PATH}`]: PLAN_OFFERS,
      [`POST ${CHECKOUT_PATH}`]: () => {
        throw buildApiError('CONFLICT', 409);
      },
    });
    renderScreen(<SubscriptionPlansScreen />);

    fireEvent.press(
      await screen.findByRole('button', { name: 'Elegir el plan Básico con pago mes a mes' }),
    );

    await waitFor(() => {
      expect(findApiCall('POST', CHECKOUT_PATH)).toBeDefined();
    });
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
