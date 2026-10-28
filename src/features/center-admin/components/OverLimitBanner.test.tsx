import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import { useSessionStore } from '@/shared/auth/session-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import { findApiCall, mockApi } from '@/test/mock-api';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { OverLimitBanner } from './OverLimitBanner';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const SUBSCRIPTION_PATH = `/v1/centers/${NORTE_CENTER_ID}/subscription`;

const SUBSCRIPTION = {
  status: 'active',
  trialEndsAt: null,
  planId: 'basic',
  billingPeriod: 'monthly',
  graceEndsAt: null,
  hasSubscription: true,
  isPlanRequired: false,
  features: [],
  maxClients: 150,
  activeClientCount: 212,
};

function mockSubscription(overrides: object = {}): void {
  mockApi({ [`GET ${SUBSCRIPTION_PATH}`]: { ...SUBSCRIPTION, ...overrides } });
}

async function waitForSubscriptionRequest(): Promise<void> {
  await waitFor(() => {
    expect(findApiCall('GET', SUBSCRIPTION_PATH)).toBeDefined();
  });
  await act(async () => {
    await Promise.resolve();
  });
}

describe('OverLimitBanner', () => {
  beforeEach(() => {
    resetMockRouter();
    act(() => {
      useSessionStore.getState().startSession({ accessToken: 'token', user: null });
      useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
    });
  });

  it('warns that nobody loses access and says how many clients are over the limit', async () => {
    mockSubscription();
    renderScreen(<OverLimitBanner />);

    expect(await screen.findByText('Has superado el límite de tu plan')).toBeOnTheScreen();
    expect(screen.getByText(/Todos tus clientes siguen con acceso/)).toBeOnTheScreen();
    expect(screen.getByText(/Quedan 62 de más/)).toBeOnTheScreen();
  });

  it('opens the subscription screen when pressed', async () => {
    mockSubscription();
    renderScreen(<OverLimitBanner />);

    fireEvent.press(await screen.findByRole('button', { name: /Has superado el límite/ }));

    expect(getMockRouter().push).toHaveBeenCalledWith('/(admin)/subscription');
  });

  it.each([
    { name: 'the clients fit in the limit', overrides: { activeClientCount: 150 } },
    { name: 'the plan has no limit', overrides: { maxClients: null } },
  ])('shows nothing when $name', async ({ overrides }) => {
    mockSubscription(overrides);
    renderScreen(<OverLimitBanner />);

    await waitForSubscriptionRequest();

    expect(screen.queryByText('Has superado el límite de tu plan')).not.toBeOnTheScreen();
  });
});
