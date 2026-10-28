import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import * as expoRouter from 'expo-router';

import { useSessionStore } from '@/shared/auth/session-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import { findApiCall, mockApi } from '@/test/mock-api';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { PlanRequiredGate } from './PlanRequiredGate';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const SUBSCRIPTION_PATH = `/v1/centers/${NORTE_CENTER_ID}/subscription`;

const TRIAL_OVER = {
  status: 'trial',
  trialEndsAt: '2026-11-05T10:00:00.000Z',
  planId: 'pro',
  billingPeriod: null,
  graceEndsAt: null,
  hasSubscription: false,
  isPlanRequired: true,
  features: [],
  maxClients: 500,
  activeClientCount: 20,
};

function mockSubscription(overrides: object = {}): void {
  mockApi({ [`GET ${SUBSCRIPTION_PATH}`]: { ...TRIAL_OVER, ...overrides } });
}

describe('PlanRequiredGate', () => {
  beforeEach(() => {
    resetMockRouter();
    jest.mocked(expoRouter.usePathname).mockReturnValue('/center');
    act(() => {
      useSessionStore.getState().startSession({ accessToken: 'token', user: null });
      useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
    });
  });

  it('covers the app when the free trial is over, without saying how to pay, and shows the plans', async () => {
    mockSubscription();
    renderScreen(<PlanRequiredGate />);

    expect(await screen.findByText('Tu prueba gratuita ha terminado')).toBeOnTheScreen();
    expect(screen.getByText(/no tiene un plan activo/)).toBeOnTheScreen();
    expect(screen.queryByText(/correo|enlace/i)).toBeNull();
    fireEvent.press(screen.getByRole('button', { name: 'Ver los planes' }));

    expect(getMockRouter().push).toHaveBeenCalledWith('/(admin)/subscription/plans');
  });

  it('explains a suspension in other words than the end of the trial', async () => {
    mockSubscription({ status: 'suspended', hasSubscription: true });
    renderScreen(<PlanRequiredGate />);

    expect(await screen.findByText('Tu suscripción está suspendida')).toBeOnTheScreen();
  });

  it('lets the owner work while the trial is still running', async () => {
    mockSubscription({ isPlanRequired: false });
    renderScreen(<PlanRequiredGate />);

    await waitFor(() => {
      expect(findApiCall('GET', SUBSCRIPTION_PATH)).toBeDefined();
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.queryByText('Tu prueba gratuita ha terminado')).not.toBeOnTheScreen();
  });

  it('does not cover the subscription screens, where the plans are shown', async () => {
    jest.mocked(expoRouter.usePathname).mockReturnValue('/subscription/plans');
    mockSubscription();
    renderScreen(<PlanRequiredGate />);

    await waitFor(() => {
      expect(findApiCall('GET', SUBSCRIPTION_PATH)).toBeDefined();
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.queryByText('Tu prueba gratuita ha terminado')).not.toBeOnTheScreen();
  });
});
