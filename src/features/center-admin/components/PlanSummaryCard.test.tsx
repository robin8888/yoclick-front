import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import { useSessionStore } from '@/shared/auth/session-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import { findApiCall, mockApi } from '@/test/mock-api';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { PlanSummaryCard } from './PlanSummaryCard';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const SUBSCRIPTION_PATH = `/v1/centers/${NORTE_CENTER_ID}/subscription`;

const PAYING = {
  status: 'active',
  trialEndsAt: null,
  planId: 'pro',
  billingPeriod: 'monthly',
  graceEndsAt: null,
  hasSubscription: true,
  isPlanRequired: false,
  features: [],
  maxClients: 500,
  activeClientCount: 20,
};

function mockSubscription(overrides: object = {}): void {
  mockApi({ [`GET ${SUBSCRIPTION_PATH}`]: { ...PAYING, ...overrides } });
}

describe('PlanSummaryCard', () => {
  beforeEach(() => {
    resetMockRouter();
    act(() => {
      useSessionStore.getState().startSession({ accessToken: 'token', user: null });
      useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
    });
  });

  it('says the center is in trial, and not the plan assigned for the trial, with the days left', async () => {
    const trialEndsAt = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();
    mockSubscription({ status: 'trial', hasSubscription: false, billingPeriod: null, trialEndsAt });
    renderScreen(<PlanSummaryCard />);

    expect(await screen.findByText('En prueba')).toBeOnTheScreen();
    expect(screen.getByText(/Te quedan 10 días de prueba gratuita/)).toBeOnTheScreen();
    expect(screen.queryByText('Plan Pro')).not.toBeOnTheScreen();
  });

  it('shows the plan the center pays and its status', async () => {
    mockSubscription();
    renderScreen(<PlanSummaryCard />);

    expect(await screen.findByText('Plan Pro')).toBeOnTheScreen();
    expect(screen.getByText('Activo')).toBeOnTheScreen();
  });

  it('opens the subscription screen when pressed', async () => {
    mockSubscription();
    renderScreen(<PlanSummaryCard />);

    fireEvent.press(await screen.findByRole('button', { name: /Abrir mi suscripción/ }));

    expect(getMockRouter().push).toHaveBeenCalledWith('/(admin)/subscription');
  });

  it('takes no room while the plan cannot be read', async () => {
    mockApi({});
    renderScreen(<PlanSummaryCard />);

    await waitFor(() => {
      expect(findApiCall('GET', SUBSCRIPTION_PATH)).toBeDefined();
    });
    expect(screen.queryByRole('button')).not.toBeOnTheScreen();
  });
});
