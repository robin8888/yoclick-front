import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import { useSessionStore } from '@/shared/auth/session-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import { findApiCall, mockApi } from '@/test/mock-api';
import { resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { PrivacyLegalScreen } from './PrivacyLegalScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const BASE = `/v1/centers/${NORTE_CENTER_ID}`;
const CONSENTS = {
  clientCount: 212,
  privacy: 212,
  health: 148,
  marketing: 96,
  image: 71,
  parental: 23,
};

function buildRequest(overrides: Record<string, unknown> = {}) {
  return {
    id: 'request-1',
    clientMembershipId: 'client-1',
    clientName: 'Diego Martín',
    kind: 'access',
    status: 'open',
    message: null,
    dueAt: '2099-10-25T10:00:00.000Z',
    createdAt: '2026-09-25T10:00:00.000Z',
    resolvedAt: null,
    resolutionNote: null,
    ...overrides,
  };
}

function mockLegalApi(requests: unknown[], extra: Record<string, unknown> = {}): void {
  mockApi({
    'GET /v1/me/memberships': { memberships: [] },
    [`GET ${BASE}/privacy/consents`]: CONSENTS,
    [`GET ${BASE}/privacy-requests`]: { requests },
    ...extra,
  });
}

describe('requests of the clients in PrivacyLegalScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    act(() => {
      useSessionStore.getState().startSession({ accessToken: 'token', user: null });
      useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
    });
  });

  it('lists who asked for what, with the deadline and what they said', async () => {
    mockLegalApi([buildRequest({ message: 'Quiero ver mis datos.' })]);
    renderScreen(<PrivacyLegalScreen />);

    expect(await screen.findByText('Acceso a los datos · Diego Martín')).toBeOnTheScreen();
    expect(screen.getByText('Plazo: 25/10/2099')).toBeOnTheScreen();
    expect(screen.getByText('Dice: Quiero ver mis datos.')).toBeOnTheScreen();
    expect(screen.getByText(/exporta sus datos desde su ficha/)).toBeOnTheScreen();
  });

  it('warns when the deadline has passed', async () => {
    mockLegalApi([buildRequest({ dueAt: '2026-01-01T10:00:00.000Z' })]);
    renderScreen(<PrivacyLegalScreen />);

    expect(await screen.findByText('Fuera de plazo')).toBeOnTheScreen();
  });

  it('says there are no requests', async () => {
    mockLegalApi([]);
    renderScreen(<PrivacyLegalScreen />);

    expect(await screen.findByText(/No hay solicitudes/)).toBeOnTheScreen();
  });

  it('marks a request as completed with an optional note', async () => {
    mockLegalApi([buildRequest()], {
      [`POST ${BASE}/privacy-requests/request-1/resolve`]: buildRequest({ status: 'completed' }),
    });
    renderScreen(<PrivacyLegalScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Responder: Diego Martín' }));
    fireEvent.changeText(
      screen.getByLabelText('Nota para la persona'),
      'Te hemos enviado tus datos.',
    );
    fireEvent.press(screen.getByRole('button', { name: 'Marcar como atendida' }));

    await waitFor(() => {
      expect(findApiCall('POST', `${BASE}/privacy-requests/request-1/resolve`)?.body).toEqual({
        outcome: 'completed',
        note: 'Te hemos enviado tus datos.',
      });
    });
  });

  it('completes without a note, but cannot reject without saying why', async () => {
    mockLegalApi([buildRequest()], {
      [`POST ${BASE}/privacy-requests/request-1/resolve`]: buildRequest({ status: 'completed' }),
    });
    renderScreen(<PrivacyLegalScreen />);
    fireEvent.press(await screen.findByRole('button', { name: 'Responder: Diego Martín' }));

    expect(screen.getByRole('button', { name: 'Rechazar' })).toBeDisabled();
    fireEvent.press(screen.getByRole('button', { name: 'Marcar como atendida' }));

    await waitFor(() => {
      expect(findApiCall('POST', `${BASE}/privacy-requests/request-1/resolve`)?.body).toEqual({
        outcome: 'completed',
      });
    });
  });

  it('rejects a request with the reason', async () => {
    mockLegalApi([buildRequest({ kind: 'rectification' })], {
      [`POST ${BASE}/privacy-requests/request-1/resolve`]: buildRequest({ status: 'rejected' }),
    });
    renderScreen(<PrivacyLegalScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Responder: Diego Martín' }));
    fireEvent.changeText(
      screen.getByLabelText('Nota para la persona'),
      'No hay nada que corregir.',
    );
    fireEvent.press(screen.getByRole('button', { name: 'Rechazar' }));

    await waitFor(() => {
      expect(findApiCall('POST', `${BASE}/privacy-requests/request-1/resolve`)?.body).toEqual({
        outcome: 'rejected',
        note: 'No hay nada que corregir.',
      });
    });
  });

  it('does not offer to answer a request that is already closed', async () => {
    mockLegalApi([buildRequest({ status: 'completed', resolvedAt: '2026-09-30T10:00:00.000Z' })]);
    renderScreen(<PrivacyLegalScreen />);

    expect(await screen.findByText('Respondida el 30/09/2026')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: /Responder/ })).toBeNull();
  });
});
