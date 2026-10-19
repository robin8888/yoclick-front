import { act, screen } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';

import { useSessionStore } from '@/shared/auth/session-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import { mockApi } from '@/test/mock-api';
import { resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { ReceiptScreen } from './ReceiptScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const PAYMENT_ID = '0191d6a0-0000-7000-8000-0000000000d1';

describe('ReceiptScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    jest.mocked(useLocalSearchParams).mockReturnValue({ paymentId: PAYMENT_ID });
    act(() => {
      useSessionStore.getState().startSession({ accessToken: 'token', user: null });
      useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
    });
  });

  it('shows who charges, the base, the VAT included in the price and the total', async () => {
    mockApi({
      [`GET /v1/centers/${NORTE_CENTER_ID}/payments/${PAYMENT_ID}/receipt`]: {
        receiptNumber: '2026-000007',
        issuedAt: '2026-10-19T10:00:00.000Z',
        seller: {
          legalName: 'Academia Ninja SL',
          taxId: 'B12345678',
          taxAddress: 'Calle Mayor 1',
        },
        buyerName: 'Ana Ruiz',
        concept: 'Bono 10 clases',
        baseCents: 4132,
        vatRatePercent: 21,
        vatCents: 868,
        totalCents: 5000,
        refundedCents: 2000,
      },
    });
    renderScreen(<ReceiptScreen />);

    expect(await screen.findByText('2026-000007')).toBeOnTheScreen();
    expect(screen.getByText('Academia Ninja SL · B12345678 · Calle Mayor 1')).toBeOnTheScreen();
    expect(screen.getByText('IVA (21 %)')).toBeOnTheScreen();
    expect(screen.getByText('El precio incluye el IVA.')).toBeOnTheScreen();
    expect(screen.getByText(/Reembolsado/)).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Compartir recibo (PDF)' })).toBeOnTheScreen();
  });
});
