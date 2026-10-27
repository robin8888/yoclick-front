import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';
import { Share } from 'react-native';

import { useSessionStore } from '@/shared/auth/session-store';
import { freezeClockAt, restoreClock } from '@/test/freeze-clock';
import { findApiCall, getRecordedApiCalls, mockApi } from '@/test/mock-api';
import { resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { PlatformCenterScreen } from './PlatformCenterScreen';
import { PlatformHomeScreen } from './PlatformHomeScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));
jest.mock('@/shared/api/api-config', () => ({ getApiBaseUrl: () => 'https://api.test' }));

const CENTER_ID = '0191d6a0-0000-7000-8000-000000000a01';
const CHARGE_ID = '0191d6a0-0000-7000-8000-000000000c01';
const NOW = '2026-10-21T10:00:00.000Z';
const CHARGES_PATH = '/v1/platform/charges';

const OVERVIEW = {
  generatedAt: NOW,
  centers: {
    total: 1,
    byStatus: { trial: 0, active: 1, past_due: 0, suspended: 0 },
    newLast30Days: 0,
    trialsEndingWithin7Days: 0,
  },
  people: { activeClients: 0, activeTeamMembers: 0 },
  bookingsLast30Days: 0,
  monthly: { newCenters: [], bookings: [] },
  centersBySector: [],
};

const PLANS = {
  plans: [
    {
      id: 'pro',
      name: 'Pro',
      monthlyPriceCents: 7900,
      annualMonthlyPriceCents: 6500,
      setupFeeCents: 0,
      maxClients: 500,
      documentStorageLimitBytes: 5_368_709_120,
      videoStorageLimitBytes: null,
      centerCountByStatus: { trial: 0, active: 1, past_due: 0, suspended: 0 },
    },
  ],
  monthlyRecurringRevenueCents: 7900,
};

function buildCharge(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: CHARGE_ID,
    centerId: CENTER_ID,
    centerName: 'Yoga Norte',
    chargedOn: '2026-10-15',
    concept: 'Suscripción plan Pro',
    baseCents: 7900,
    vatBasisPoints: 2100,
    vatCents: 1659,
    totalCents: 9559,
    stripeFeeCents: null,
    status: 'paid',
    source: 'manual',
    paymentMethod: 'transfer',
    invoiceReference: null,
    stripeId: null,
    customerLegalName: null,
    customerTaxId: null,
    createdAt: '2026-10-15T10:00:00.000Z',
    ...overrides,
  };
}

const REPORT = {
  months: [
    {
      month: '2026-10',
      baseCents: 15800,
      vatCents: 3318,
      totalCents: 19118,
      chargeCount: 2,
      stripeFeeCents: 0,
    },
  ],
  totals: {
    baseCents: 15800,
    vatCents: 3318,
    totalCents: 19118,
    chargeCount: 2,
    stripeFeeCents: 0,
  },
};

function signIn(): void {
  act(() => {
    useSessionStore.getState().startSession({ accessToken: 'token', user: null });
  });
}

describe('charges and reports in the platform home', () => {
  beforeEach(() => {
    resetMockRouter();
    signIn();
    freezeClockAt(NOW);
  });

  afterEach(() => {
    restoreClock();
    jest.restoreAllMocks();
  });

  it('lists the charges of the current month for the admin, with base, VAT and total', async () => {
    mockApi({
      'GET /v1/me': { platformRole: 'admin' },
      'GET /v1/platform/overview': OVERVIEW,
      [`GET ${CHARGES_PATH}`]: { data: [buildCharge()], nextCursor: null },
    });
    renderScreen(<PlatformHomeScreen />);

    fireEvent.press(await screen.findByRole('tab', { name: 'Cobros' }));

    expect(await screen.findByText('Yoga Norte')).toBeOnTheScreen();
    expect(screen.getByText('octubre de 2026')).toBeOnTheScreen();
    expect(screen.getByText(/Base 79.*IVA 16,59.*\(21 %\)/)).toBeOnTheScreen();
    expect(screen.getByText(/95,59/)).toBeOnTheScreen();
    expect(findApiCall('GET', CHARGES_PATH)?.path).toContain('month=2026-10');
  });

  it('asks for the previous month when going back', async () => {
    mockApi({
      'GET /v1/me': { platformRole: 'admin' },
      'GET /v1/platform/overview': OVERVIEW,
      [`GET ${CHARGES_PATH}`]: { data: [], nextCursor: null },
    });
    renderScreen(<PlatformHomeScreen />);

    fireEvent.press(await screen.findByRole('tab', { name: 'Cobros' }));
    fireEvent.press(await screen.findByRole('button', { name: 'Periodo anterior' }));

    expect(await screen.findByText('septiembre de 2026')).toBeOnTheScreen();
    await waitFor(() => {
      expect(getLastChargesPath()).toContain('month=2026-09');
    });
  });

  it('saves the invoice reference of a charge', async () => {
    mockApi({
      'GET /v1/me': { platformRole: 'admin' },
      'GET /v1/platform/overview': OVERVIEW,
      [`GET ${CHARGES_PATH}`]: { data: [buildCharge()], nextCursor: null },
      [`PATCH ${CHARGES_PATH}/${CHARGE_ID}`]: buildCharge({ invoiceReference: 'F-2026-001' }),
    });
    renderScreen(<PlatformHomeScreen />);

    fireEvent.press(await screen.findByRole('tab', { name: 'Cobros' }));
    fireEvent.press(await screen.findByRole('button', { name: 'Editar el cobro de Yoga Norte' }));
    fireEvent.changeText(await screen.findByLabelText('Referencia de factura'), ' F-2026-001 ');
    fireEvent.press(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => {
      expect(findApiCall('PATCH', `${CHARGES_PATH}/${CHARGE_ID}`)?.body).toEqual({
        invoiceReference: 'F-2026-001',
      });
    });
  });

  it('only voids a charge on the second press', async () => {
    mockApi({
      'GET /v1/me': { platformRole: 'admin' },
      'GET /v1/platform/overview': OVERVIEW,
      [`GET ${CHARGES_PATH}`]: { data: [buildCharge()], nextCursor: null },
      [`PATCH ${CHARGES_PATH}/${CHARGE_ID}`]: buildCharge({ status: 'void' }),
    });
    renderScreen(<PlatformHomeScreen />);

    fireEvent.press(await screen.findByRole('tab', { name: 'Cobros' }));
    fireEvent.press(await screen.findByRole('button', { name: 'Editar el cobro de Yoga Norte' }));
    fireEvent.press(await screen.findByRole('button', { name: 'Anular cobro' }));

    expect(await screen.findByText(/no se puede volver a cambiar/)).toBeOnTheScreen();
    expect(findApiCall('PATCH', CHARGES_PATH)).toBeUndefined();

    fireEvent.press(screen.getByRole('button', { name: 'Anular cobro' }));

    await waitFor(() => {
      expect(findApiCall('PATCH', `${CHARGES_PATH}/${CHARGE_ID}`)?.body).toEqual({
        status: 'void',
      });
    });
  });

  it('shows the accountant the charges and the reports, read-only', async () => {
    mockApi({
      'GET /v1/me': { platformRole: 'accountant' },
      'GET /v1/platform/reports/monthly': REPORT,
      [`GET ${CHARGES_PATH}`]: { data: [buildCharge()], nextCursor: null },
    });
    renderScreen(<PlatformHomeScreen />);

    fireEvent.press(await screen.findByRole('tab', { name: 'Cobros' }));

    expect(await screen.findByText('Yoga Norte')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: /Editar el cobro/ })).toBeNull();
    expect(screen.queryByRole('tab', { name: 'Centros' })).toBeNull();
    expect(findApiCall('GET', '/v1/platform/overview')).toBeUndefined();
  });

  it('shows the quarter totals and shares the CSV for the accountant', async () => {
    const csvText = 'Fecha de cobro;Total\r\n2026-10-15;95,59\r\n';
    const share = jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' });
    mockApi({
      'GET /v1/me': { platformRole: 'accountant' },
      'GET /v1/platform/reports/monthly': REPORT,
      'GET /v1/platform/reports/export.csv': csvText,
    });
    renderScreen(<PlatformHomeScreen />);

    expect(await screen.findByText('4.º trimestre de 2026')).toBeOnTheScreen();
    expect(await screen.findByText(/Base imponible/)).toBeOnTheScreen();
    expect(screen.getByLabelText(/IVA repercutido: 33,18/)).toBeOnTheScreen();
    expect(findApiCall('GET', '/v1/platform/reports/monthly')?.path).toContain(
      'fromMonth=2026-10&toMonth=2026-12',
    );

    fireEvent.press(screen.getByRole('button', { name: 'Compartir CSV para el gestor' }));

    await waitFor(() => {
      expect(share).toHaveBeenCalledWith(expect.objectContaining({ message: csvText }));
    });
  });
});

function getLastChargesPath(): string {
  return (
    getRecordedApiCalls()
      .filter((call) => call.method === 'GET' && call.path.startsWith(CHARGES_PATH))
      .at(-1)?.path ?? ''
  );
}

describe('recording a charge from the center screen', () => {
  beforeEach(() => {
    resetMockRouter();
    signIn();
    freezeClockAt(NOW);
    jest.mocked(useLocalSearchParams).mockReturnValue({ centerId: CENTER_ID });
  });

  afterEach(() => {
    restoreClock();
  });

  function mockCenterScreen(): void {
    mockApi({
      [`GET /v1/platform/centers/${CENTER_ID}`]: {
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
        lastBookingAt: null,
        timezone: 'Europe/Madrid',
        disabledModules: [],
        stripeChargesEnabled: true,
        documentStorageLimitBytes: 1_073_741_824,
        videoStorageLimitBytes: null,
        photoStorageLimitBytes: 104_857_600,
      },
      'GET /v1/platform/audit-log': { data: [], nextCursor: null },
      'GET /v1/platform/plans': PLANS,
      [`POST ${CHARGES_PATH}`]: buildCharge(),
    });
  }

  it('suggests the plan concept and price, and sends the base and the VAT rate', async () => {
    mockCenterScreen();
    renderScreen(<PlatformCenterScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Apuntar un cobro' }));

    expect(await screen.findByDisplayValue('79')).toBeOnTheScreen();
    expect(screen.getByDisplayValue('Suscripción plan Pro · octubre de 2026')).toBeOnTheScreen();
    fireEvent.changeText(screen.getByLabelText('Razón social (opcional)'), 'Yoga Norte S.L.');
    fireEvent.press(screen.getByRole('button', { name: 'Apuntar cobro' }));

    await waitFor(() => {
      expect(findApiCall('POST', CHARGES_PATH)?.body).toEqual({
        centerId: CENTER_ID,
        chargedOn: '2026-10-21',
        concept: 'Suscripción plan Pro · octubre de 2026',
        baseCents: 7900,
        vatBasisPoints: 2100,
        paymentMethod: 'transfer',
        customerLegalName: 'Yoga Norte S.L.',
      });
    });
  });

  it('does not send a base that is not an amount', async () => {
    mockCenterScreen();
    renderScreen(<PlatformCenterScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Apuntar un cobro' }));
    fireEvent.changeText(await screen.findByLabelText('Base imponible (€, sin IVA)'), 'mucho');
    fireEvent.press(screen.getByRole('button', { name: 'Apuntar cobro' }));

    expect(await screen.findByText(/Escribe un importe válido/)).toBeOnTheScreen();
    expect(findApiCall('POST', CHARGES_PATH)).toBeUndefined();
  });
});
