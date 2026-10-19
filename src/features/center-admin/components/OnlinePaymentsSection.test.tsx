import { act, fireEvent, screen } from '@testing-library/react-native';

import { useSessionStore } from '@/shared/auth/session-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import { mockApi } from '@/test/mock-api';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { OnlinePaymentsSection } from './OnlinePaymentsSection';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const STATUS_PATH = `GET /v1/centers/${NORTE_CENTER_ID}/payments/status`;

describe('OnlinePaymentsSection', () => {
  beforeEach(() => {
    resetMockRouter();
    act(() => {
      useSessionStore.getState().startSession({ accessToken: 'token', user: null });
      useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
    });
  });

  it('asks for the fiscal data, and tells prices include VAT, before activating payments', async () => {
    mockApi({
      [STATUS_PATH]: { status: 'not_started', isFiscalDataComplete: false },
      [`GET /v1/centers/${NORTE_CENTER_ID}`]: {},
    });
    renderScreen(<OnlinePaymentsSection />);

    expect(await screen.findByText(/incluyen el IVA \(21 %\)/)).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Activar cobros con Stripe' })).toBeDisabled();
    fireEvent.press(screen.getByRole('button', { name: 'Completar datos fiscales' }));

    expect(getMockRouter().push).toHaveBeenCalledWith('/(admin)/center');
  });

  it('lets the center activate payments once the fiscal data is complete', async () => {
    mockApi({ [STATUS_PATH]: { status: 'not_started', isFiscalDataComplete: true } });
    renderScreen(<OnlinePaymentsSection />);

    const activate = await screen.findByRole('button', { name: 'Activar cobros con Stripe' });

    expect(activate).toBeEnabled();
    expect(screen.queryByText(/incluyen el IVA/)).not.toBeOnTheScreen();
  });
});
