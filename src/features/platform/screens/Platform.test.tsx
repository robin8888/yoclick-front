import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';

import { useSessionStore } from '@/shared/auth/session-store';
import { freezeClockAt, restoreClock } from '@/test/freeze-clock';
import { buildApiError, findApiCall, getRecordedApiCalls, mockApi } from '@/test/mock-api';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { PlatformCenterScreen } from './PlatformCenterScreen';
import { PlatformHomeScreen } from './PlatformHomeScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));
jest.mock('@/shared/api/api-config', () => ({ getApiBaseUrl: () => 'https://api.test' }));

const CENTER_ID = '0191d6a0-0000-7000-8000-000000000a01';
const OTHER_CENTER_ID = '0191d6a0-0000-7000-8000-000000000a02';
const NOW = '2026-10-21T10:00:00.000Z';

const PROFILE = { platformRole: 'admin' } as const;

const OVERVIEW = {
  generatedAt: NOW,
  centers: {
    total: 12,
    byStatus: { trial: 5, active: 4, past_due: 2, suspended: 1 },
    newLast30Days: 3,
    trialsEndingWithin7Days: 2,
  },
  people: { activeClients: 340, activeTeamMembers: 28 },
  bookingsLast30Days: 910,
  monthly: {
    newCenters: [
      { month: '2026-09', count: 1 },
      { month: '2026-10', count: 3 },
    ],
    bookings: [
      { month: '2026-09', count: 400 },
      { month: '2026-10', count: 910 },
    ],
  },
  centersBySector: [{ sectorId: 'yoga', count: 7 }],
};

const PLANS = {
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
      centerCountByStatus: { trial: 0, active: 2, past_due: 0, suspended: 0 },
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
      centerCountByStatus: { trial: 3, active: 1, past_due: 1, suspended: 0 },
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
      centerCountByStatus: { trial: 0, active: 1, past_due: 0, suspended: 1 },
    },
  ],
  monthlyRecurringRevenueCents: 2 * 3900 + 2 * 7900 + 14900,
};

function buildCenter(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: CENTER_ID,
    name: 'Yoga Norte',
    slug: 'yoga-norte',
    sectorId: 'yoga',
    city: 'Madrid',
    status: 'active',
    logoUrl: null,
    planId: 'pro',
    createdAt: '2026-09-01T10:00:00.000Z',
    trialEndsAt: null,
    maxClients: 150,
    activeClientCount: 34,
    teamMemberCount: 2,
    bookingsLast30Days: 120,
    lastBookingAt: '2026-10-20T16:00:00.000Z',
    ...overrides,
  };
}

function buildCenterDetail(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    ...buildCenter(),
    timezone: 'Europe/Madrid',
    disabledModules: ['passes'],
    stripeChargesEnabled: true,
    documentStorageLimitBytes: 1_073_741_824,
    videoStorageLimitBytes: null,
    photoStorageLimitBytes: 104_857_600,
    ...overrides,
  };
}

function signIn(): void {
  act(() => {
    useSessionStore.getState().startSession({ accessToken: 'token', user: null });
  });
}

describe('PlatformHomeScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    signIn();
  });

  it('shows the figures of the whole platform and says it never shows people', async () => {
    mockApi({ 'GET /v1/me': PROFILE, 'GET /v1/platform/overview': OVERVIEW });
    renderScreen(<PlatformHomeScreen />);

    expect(await screen.findByLabelText('Centros en total, 12')).toBeOnTheScreen();
    expect(screen.getByLabelText('Clientes activos, 340')).toBeOnTheScreen();
    expect(screen.getByLabelText('Reservas en 30 días, 910')).toBeOnTheScreen();
    expect(screen.getByLabelText('Pruebas que acaban en 7 días, 2')).toBeOnTheScreen();
    expect(
      screen.getByText(/Nunca se muestran nombres ni datos de las personas/),
    ).toBeOnTheScreen();
  });

  it('lists the centers with their state, usage and the reason to look at them', async () => {
    mockApi({
      'GET /v1/me': PROFILE,
      'GET /v1/platform/overview': OVERVIEW,
      'GET /v1/platform/centers': {
        data: [
          buildCenter({ status: 'past_due' }),
          buildCenter({
            id: OTHER_CENTER_ID,
            name: 'Box Sur',
            status: 'active',
            activeClientCount: 200,
          }),
        ],
        nextCursor: null,
      },
    });
    renderScreen(<PlatformHomeScreen />);

    fireEvent.press(await screen.findByRole('tab', { name: 'Centros' }));

    expect(await screen.findByRole('button', { name: 'Yoga Norte, En gracia' })).toBeOnTheScreen();
    expect(screen.getAllByText('34 de 150 clientes')).toHaveLength(1);
    expect(screen.getByText('Impago')).toBeOnTheScreen();
    expect(screen.getByText('Pasa su tope de clientes')).toBeOnTheScreen();
  });

  it('opens a center from the list', async () => {
    mockApi({
      'GET /v1/me': PROFILE,
      'GET /v1/platform/overview': OVERVIEW,
      'GET /v1/platform/centers': { data: [buildCenter()], nextCursor: null },
    });
    renderScreen(<PlatformHomeScreen />);

    fireEvent.press(await screen.findByRole('tab', { name: 'Centros' }));
    fireEvent.press(await screen.findByRole('button', { name: 'Yoga Norte, Activo' }));

    expect(getMockRouter().push).toHaveBeenCalledWith({
      pathname: '/(platform)/center/[centerId]',
      params: { centerId: CENTER_ID },
    });
  });

  it('asks the server for the centers in one state', async () => {
    mockApi({
      'GET /v1/me': PROFILE,
      'GET /v1/platform/overview': OVERVIEW,
      'GET /v1/platform/centers': { data: [], nextCursor: null },
    });
    renderScreen(<PlatformHomeScreen />);

    fireEvent.press(await screen.findByRole('tab', { name: 'Centros' }));
    fireEvent.press(await screen.findByRole('radio', { name: 'Suspendido' }));

    await waitFor(() => {
      expect(getRecordedApiCalls().some((call) => call.path.includes('status=suspended'))).toBe(
        true,
      );
    });
    expect(await screen.findByText('No hay centros con ese filtro')).toBeOnTheScreen();
  });

  it('lists what has been changed from the administration, in words', async () => {
    mockApi({
      'GET /v1/me': PROFILE,
      'GET /v1/platform/overview': OVERVIEW,
      'GET /v1/platform/audit-log': {
        data: [
          {
            id: '0191d6a0-0000-7000-8000-000000000b01',
            action: 'center_status_changed',
            centerId: CENTER_ID,
            details: { from: 'trial', to: 'suspended' },
            createdAt: '2026-10-21T09:00:00.000Z',
          },
        ],
        nextCursor: null,
      },
    });
    renderScreen(<PlatformHomeScreen />);

    fireEvent.press(await screen.findByRole('tab', { name: 'Actividad' }));

    expect(await screen.findByText('Estado: En prueba → Suspendido')).toBeOnTheScreen();
  });

  it('explains how to turn on the second factor when the server asks for it', async () => {
    mockApi({
      'GET /v1/me': PROFILE,
      'GET /v1/platform/overview': () => {
        throw buildApiError('MFA_REQUIRED', 403);
      },
    });
    renderScreen(<PlatformHomeScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Activar segundo factor' }));

    expect(getMockRouter().push).toHaveBeenCalledWith('/(platform)/mfa-setup');
  });

  it('shows the accountant only the charges and the reports, never the administration', async () => {
    mockApi({
      'GET /v1/me': { platformRole: 'accountant' },
      'GET /v1/platform/reports/monthly': {
        months: [],
        totals: { baseCents: 0, vatCents: 0, totalCents: 0, chargeCount: 0, stripeFeeCents: 0 },
      },
    });
    renderScreen(<PlatformHomeScreen />);

    expect(await screen.findByRole('tab', { name: 'Informes' })).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: 'Cobros' })).toBeOnTheScreen();
    expect(screen.queryByRole('tab', { name: 'Centros' })).toBeNull();
    expect(findApiCall('GET', '/v1/platform/overview')).toBeUndefined();
  });
});

/** Las imágenes de logo de centro en pantalla (el logotipo de Yoclick de la cabecera no cuenta). */
function listCenterLogoUris(): string[] {
  return screen
    .UNSAFE_queryAllByType(Image)
    .map((image) => (image.props as { source?: { uri?: string } }).source?.uri ?? '')
    .filter((uri) => uri.includes('/logo?v='));
}

describe('center logos', () => {
  beforeEach(() => {
    resetMockRouter();
    signIn();
  });

  it('shows the logo of a center in the list when it has one', async () => {
    mockApi({
      'GET /v1/me': PROFILE,
      'GET /v1/platform/overview': OVERVIEW,
      'GET /v1/platform/centers': {
        data: [buildCenter({ logoUrl: `/v1/centers/${CENTER_ID}/logo?v=1` })],
        nextCursor: null,
      },
    });
    renderScreen(<PlatformHomeScreen />);

    fireEvent.press(await screen.findByRole('tab', { name: 'Centros' }));
    await waitFor(() => {
      expect(listCenterLogoUris()).toEqual([
        expect.stringContaining(`/v1/centers/${CENTER_ID}/logo?v=1`),
      ]);
    });
  });

  it('falls back to the initials when the center has no logo', async () => {
    mockApi({
      'GET /v1/me': PROFILE,
      'GET /v1/platform/overview': OVERVIEW,
      'GET /v1/platform/centers': { data: [buildCenter()], nextCursor: null },
    });
    renderScreen(<PlatformHomeScreen />);

    fireEvent.press(await screen.findByRole('tab', { name: 'Centros' }));
    await screen.findByText('Yoga Norte');

    expect(listCenterLogoUris()).toEqual([]);
  });
});

describe('PlansTab', () => {
  const PLAN_PATH = '/v1/platform/plans/premium';

  beforeEach(() => {
    resetMockRouter();
    signIn();
  });

  async function openPlansTab(): Promise<void> {
    renderScreen(<PlatformHomeScreen />);
    fireEvent.press(await screen.findByRole('tab', { name: 'Planes' }));
  }

  it('shows the monthly revenue and how many centers each plan has', async () => {
    mockApi({
      'GET /v1/me': PROFILE,
      'GET /v1/platform/overview': OVERVIEW,
      'GET /v1/platform/plans': PLANS,
    });
    await openPlansTab();

    expect(await screen.findByLabelText(/^Ingresos al mes, 385/)).toBeOnTheScreen();
    expect(screen.getByLabelText('5 centros con este plan')).toBeOnTheScreen();
    expect(screen.getByText(/Alta 290/)).toBeOnTheScreen();
    expect(screen.getAllByText(/Sin vídeo/)).toHaveLength(2);
    expect(
      screen.getByText('1 activos · 3 en prueba · 1 en gracia · 0 suspendidos'),
    ).toBeOnTheScreen();
  });

  it('sends only the prices that changed when saving a plan', async () => {
    mockApi({
      'GET /v1/me': PROFILE,
      'GET /v1/platform/overview': OVERVIEW,
      'GET /v1/platform/plans': PLANS,
      [`PATCH ${PLAN_PATH}`]: PLANS.plans[2],
    });
    await openPlansTab();

    fireEvent.press(
      await screen.findByRole('button', { name: 'Cambiar los precios del plan Premium' }),
    );
    fireEvent.changeText(await screen.findByLabelText('Cuota de alta (€)'), '190');
    fireEvent.changeText(screen.getByLabelText('Precio mensual (€)'), '159,50');
    fireEvent.press(screen.getByRole('button', { name: 'Guardar precios' }));

    await waitFor(() => {
      expect(findApiCall('PATCH', PLAN_PATH)?.body).toEqual({
        monthlyPriceCents: 15950,
        setupFeeCents: 19000,
      });
    });
  });

  it('does not send a price that is not an amount', async () => {
    mockApi({
      'GET /v1/me': PROFILE,
      'GET /v1/platform/overview': OVERVIEW,
      'GET /v1/platform/plans': PLANS,
    });
    await openPlansTab();

    fireEvent.press(
      await screen.findByRole('button', { name: 'Cambiar los precios del plan Pro' }),
    );
    fireEvent.changeText(await screen.findByLabelText('Precio mensual (€)'), 'mucho');
    fireEvent.press(screen.getByRole('button', { name: 'Guardar precios' }));

    expect(await screen.findByText(/Escribe un importe en euros/)).toBeOnTheScreen();
    expect(findApiCall('PATCH', '/v1/platform/plans')).toBeUndefined();
  });

  it('shows an error with retry when the plans cannot be loaded', async () => {
    mockApi({
      'GET /v1/me': PROFILE,
      'GET /v1/platform/overview': OVERVIEW,
      'GET /v1/platform/plans': () => {
        throw buildApiError('INTERNAL_ERROR', 500);
      },
    });
    await openPlansTab();

    expect(await screen.findByText('No hemos podido cargar los planes')).toBeOnTheScreen();
  });
});

describe('PlatformCenterScreen', () => {
  const CENTER_PATH = `/v1/platform/centers/${CENTER_ID}`;

  beforeEach(() => {
    resetMockRouter();
    signIn();
    jest.mocked(useLocalSearchParams).mockReturnValue({ centerId: CENTER_ID });
    freezeClockAt(NOW);
  });

  afterEach(() => {
    restoreClock();
  });

  function mockCenter(detail: Record<string, unknown> = buildCenterDetail()): void {
    mockApi({
      [`GET ${CENTER_PATH}`]: detail,
      [`PATCH ${CENTER_PATH}`]: detail,
      'GET /v1/platform/audit-log': { data: [], nextCursor: null },
    });
  }

  it('shows the business, plan and usage of the center, with no data of people', async () => {
    mockCenter();
    renderScreen(<PlatformCenterScreen />);

    expect(await screen.findByText('Yoga Norte')).toBeOnTheScreen();
    expect(screen.getByLabelText('Tope de clientes: 150')).toBeOnTheScreen();
    expect(screen.getByLabelText('Espacio de vídeo: No incluido')).toBeOnTheScreen();
    expect(screen.getByText('Todavía no se ha cambiado nada de este centro.')).toBeOnTheScreen();
  });

  it('extends the trial from its current end after asking for confirmation', async () => {
    mockCenter(buildCenterDetail({ status: 'trial', trialEndsAt: '2026-10-25T10:00:00.000Z' }));
    renderScreen(<PlatformCenterScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Ampliar la prueba 7 días' }));
    fireEvent.press(await screen.findByRole('button', { name: 'Sí, ampliar' }));

    await waitFor(() => {
      expect(findApiCall('PATCH', CENTER_PATH)?.body).toEqual({
        trialEndsAt: '2026-11-01T10:00:00.000Z',
      });
    });
  });

  it('moves a center to another plan only after confirming', async () => {
    mockCenter();
    renderScreen(<PlatformCenterScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Pasar al plan Premium' }));
    fireEvent.press(await screen.findByRole('button', { name: 'Sí, cambiar de plan' }));

    await waitFor(() => {
      expect(findApiCall('PATCH', CENTER_PATH)?.body).toEqual({ planId: 'premium' });
    });
  });

  it('suspends a center only after confirming', async () => {
    mockCenter();
    renderScreen(<PlatformCenterScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Suspender el centro' }));
    expect(findApiCall('PATCH', CENTER_PATH)).toBeUndefined();
    fireEvent.press(await screen.findByRole('button', { name: 'Sí, suspender' }));

    await waitFor(() => {
      expect(findApiCall('PATCH', CENTER_PATH)?.body).toEqual({ status: 'suspended' });
    });
  });

  it('offers to reactivate, not to suspend, a suspended center', async () => {
    mockCenter(buildCenterDetail({ status: 'suspended' }));
    renderScreen(<PlatformCenterScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Reactivar el centro' }));
    fireEvent.press(await screen.findByRole('button', { name: 'Sí, reactivar' }));

    expect(screen.queryByRole('button', { name: 'Suspender el centro' })).toBeNull();
    await waitFor(() => {
      expect(findApiCall('PATCH', CENTER_PATH)?.body).toEqual({ status: 'active' });
    });
  });

  it.each([
    { typed: '200', body: { maxClients: 200 } },
    { typed: '', body: { maxClients: null } },
  ])('saves the client cap "$typed"', async ({ typed, body }) => {
    mockCenter();
    renderScreen(<PlatformCenterScreen />);

    fireEvent.changeText(
      await screen.findByLabelText('Tope de clientes (vacío = sin tope)'),
      typed,
    );
    fireEvent.press(screen.getByRole('button', { name: 'Guardar tope' }));

    await waitFor(() => {
      expect(findApiCall('PATCH', CENTER_PATH)?.body).toEqual(body);
    });
  });

  it('does not send a cap that is not a whole number', async () => {
    mockCenter();
    renderScreen(<PlatformCenterScreen />);

    fireEvent.changeText(
      await screen.findByLabelText('Tope de clientes (vacío = sin tope)'),
      'muchos',
    );
    fireEvent.press(screen.getByRole('button', { name: 'Guardar tope' }));

    expect(await screen.findByText(/Escribe un número entero/)).toBeOnTheScreen();
    expect(findApiCall('PATCH', CENTER_PATH)).toBeUndefined();
  });

  it('explains why a change failed', async () => {
    mockApi({
      [`GET ${CENTER_PATH}`]: buildCenterDetail(),
      [`PATCH ${CENTER_PATH}`]: () => {
        throw buildApiError('INTERNAL_ERROR', 500);
      },
      'GET /v1/platform/audit-log': { data: [], nextCursor: null },
    });
    renderScreen(<PlatformCenterScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Suspender el centro' }));
    fireEvent.press(await screen.findByRole('button', { name: 'Sí, suspender' }));

    expect(await screen.findByRole('alert')).toBeOnTheScreen();
  });

  it('offers a retry when the center cannot be loaded', async () => {
    mockApi({
      [`GET ${CENTER_PATH}`]: () => {
        throw buildApiError('NOT_FOUND', 404);
      },
      'GET /v1/platform/audit-log': { data: [], nextCursor: null },
    });
    renderScreen(<PlatformCenterScreen />);

    expect(await screen.findByText('No hemos podido cargar el centro')).toBeOnTheScreen();
  });
});
