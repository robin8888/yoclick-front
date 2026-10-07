import { act, fireEvent, screen } from '@testing-library/react-native';
import { Share } from 'react-native';

import { useSessionStore } from '@/shared/auth/session-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import { findApiCall, mockApi } from '@/test/mock-api';
import { renderScreen } from '@/test/render-screen';

import { ReportsScreen } from './ReportsScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const REPORT_PATH = `/v1/centers/${NORTE_CENTER_ID}/reports`;
const REPORT = {
  period: 'month',
  fromDate: '2026-09-08',
  toDate: '2026-10-07',
  estimatedIncomeCents: 842000,
  previousEstimatedIncomeCents: 794000,
  averageOccupancyPercent: 78,
  retentionThreeMonthsPercent: 84,
  activeClientCount: 212,
  inactiveClientCount: 14,
  incomeByMonth: [
    { month: '2026-05', incomeCents: 730000 },
    { month: '2026-06', incomeCents: 620000 },
    { month: '2026-07', incomeCents: 540000 },
    { month: '2026-08', incomeCents: 590000 },
    { month: '2026-09', incomeCents: 840000 },
    { month: '2026-10', incomeCents: 200000 },
  ],
  services: [
    { serviceId: 'a', name: 'Sesión personal', sessionCount: 40, occupancyPercent: 91 },
    { serviceId: 'b', name: 'Yoga suave', sessionCount: 12, occupancyPercent: 55 },
  ],
  staff: [
    {
      membershipId: 'm1',
      fullName: 'Marta Gil',
      sessionCount: 46,
      hours: 44.5,
      occupancyPercent: 84,
    },
  ],
  retentionByJoinMonth: [
    {
      month: '2026-07',
      joinedCount: 14,
      retainedAfterOneMonthPercent: 92,
      retainedAfterThreeMonthsPercent: 79,
    },
    {
      month: '2026-10',
      joinedCount: 26,
      retainedAfterOneMonthPercent: null,
      retainedAfterThreeMonthsPercent: null,
    },
  ],
};

function signInAsOwner(): void {
  act(() => {
    useSessionStore.getState().startSession({ accessToken: 'token', user: null });
    useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
  });
}

describe('ReportsScreen', () => {
  beforeEach(() => {
    signInAsOwner();
    mockApi({ 'GET /v1/me/memberships': { memberships: [] }, [`GET ${REPORT_PATH}`]: REPORT });
  });

  it('shows the figures of the month with the change against the previous period', async () => {
    renderScreen(<ReportsScreen />);

    expect(await screen.findByLabelText(/Ingresos estimados: 8420\s€/)).toBeOnTheScreen();
    expect(screen.getByText('+6 % frente al periodo anterior')).toBeOnTheScreen();
    expect(screen.getByLabelText(/Ocupación media: 78/)).toBeOnTheScreen();
    expect(screen.getByLabelText(/Retención a 3 meses: 84/)).toBeOnTheScreen();
    expect(screen.getByText(/14 .* sin venir en 30 días/)).toBeOnTheScreen();
  });

  it('lists the occupancy of each service and warns about the low ones', async () => {
    renderScreen(<ReportsScreen />);

    expect(await screen.findByLabelText(/Sesión personal: 91/)).toBeOnTheScreen();
    expect(screen.getByLabelText(/Yoga suave: 55/)).toBeOnTheScreen();
    expect(screen.getByText(/Por debajo del 60 %/)).toBeOnTheScreen();
  });

  it('shows a dash where a cohort is too recent to measure retention', async () => {
    renderScreen(<ReportsScreen />);

    expect(await screen.findByText('Retención por mes de alta')).toBeOnTheScreen();
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(2);
  });

  it('asks the server again when the period changes', async () => {
    renderScreen(<ReportsScreen />);
    await screen.findByText('Informes');

    fireEvent.press(await screen.findByRole('tab', { name: 'Trimestre' }));

    expect(await screen.findByRole('tab', { name: 'Trimestre', selected: true })).toBeOnTheScreen();
    expect(findApiCall('GET', `${REPORT_PATH}?period=quarter`)).toBeDefined();
  });

  it('shares the staff report as CSV', async () => {
    const shareSpy = jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' });
    renderScreen(<ReportsScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Exportar el informe a CSV' }));

    const [sharedContent] = shareSpy.mock.calls[0] ?? [];
    expect(sharedContent?.message).toContain('Marta Gil;46;44,5;84');
  });

  it('offers a retry when the report cannot be loaded', async () => {
    mockApi({ 'GET /v1/me/memberships': { memberships: [] } });
    renderScreen(<ReportsScreen />);

    expect(await screen.findByText('No hemos podido cargar los informes')).toBeOnTheScreen();
  });
});
