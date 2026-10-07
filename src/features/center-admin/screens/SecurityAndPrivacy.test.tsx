import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import { useSessionStore } from '@/shared/auth/session-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import { findApiCall, mockApi } from '@/test/mock-api';
import { resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { AccountSecurityScreen } from './AccountSecurityScreen';
import { PrivacyLegalScreen } from './PrivacyLegalScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));
jest.mock('@/shared/storage/secure', () => ({
  secureStorage: { readRefreshToken: jest.fn(() => Promise.resolve('refresh-token')) },
}));

const ACTIVITY_PATH = `/v1/centers/${NORTE_CENTER_ID}/activity`;
const CONSENTS_PATH = `/v1/centers/${NORTE_CENTER_ID}/privacy/consents`;
const TABLET_ID = '0191d6a0-0000-7000-8000-0000000000a2';
const SESSIONS = {
  sessions: [
    {
      id: '0191d6a0-0000-7000-8000-0000000000a1',
      deviceName: 'iPhone · app',
      startedAt: '2026-10-06T07:00:00.000Z',
      lastActiveAt: '2026-10-06T07:00:00.000Z',
      isCurrent: true,
    },
    {
      id: TABLET_ID,
      deviceName: 'iPad · app',
      startedAt: '2026-09-24T07:00:00.000Z',
      lastActiveAt: '2026-09-24T07:00:00.000Z',
      isCurrent: false,
    },
  ],
};

function signInAsOwner(): void {
  act(() => {
    useSessionStore.getState().startSession({ accessToken: 'token', user: null });
    useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
  });
}

describe('AccountSecurityScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    signInAsOwner();
    mockApi({
      'GET /v1/me/memberships': { memberships: [] },
      'GET /v1/me/mfa': { isEnabled: true, recoveryCodesRemaining: 8 },
      'POST /v1/me/sessions/list': SESSIONS,
      [`GET ${ACTIVITY_PATH}`]: {
        entries: [
          {
            id: '0191d6a0-0000-7000-8000-0000000000b1',
            kind: 'service_updated',
            subject: 'Clase particular',
            actorName: 'Marta Ruiz',
            createdAt: new Date().toISOString(),
          },
        ],
      },
    });
  });

  it('shows the two-step status, the open sessions and what the team did', async () => {
    renderScreen(<AccountSecurityScreen />);

    expect(await screen.findByText('Activa')).toBeOnTheScreen();
    expect(await screen.findByText('Esta sesión')).toBeOnTheScreen();
    expect(screen.getByText('iPad · app')).toBeOnTheScreen();
    expect(await screen.findByText(/cambió el servicio «Clase particular»/)).toBeOnTheScreen();
  });

  it('closes another device but offers no button for this one', async () => {
    mockApi({
      'POST /v1/me/sessions/list': SESSIONS,
      [`POST /v1/me/sessions/${TABLET_ID}/revoke`]: {},
    });
    renderScreen(<AccountSecurityScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Cerrar' }));

    await waitFor(() => {
      expect(findApiCall('POST', `/v1/me/sessions/${TABLET_ID}/revoke`)).toBeDefined();
    });
    expect(screen.getAllByRole('button', { name: 'Cerrar' })).toHaveLength(1);
  });
});

describe('PrivacyLegalScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    signInAsOwner();
    mockApi({
      'GET /v1/me/memberships': { memberships: [] },
      [`GET /v1/centers/${NORTE_CENTER_ID}/privacy-requests`]: { requests: [] },
      [`GET ${CONSENTS_PATH}`]: {
        clientCount: 212,
        privacy: 212,
        health: 148,
        marketing: 96,
        image: 71,
        parental: 23,
      },
    });
  });

  it('shows how many clients gave each consent', async () => {
    renderScreen(<PrivacyLegalScreen />);

    expect(await screen.findByText('212 de 212')).toBeOnTheScreen();
    expect(screen.getByText('148')).toBeOnTheScreen();
    expect(screen.getByText('96')).toBeOnTheScreen();
    expect(screen.getByText('Consentimiento parental')).toBeOnTheScreen();
    expect(screen.getByText(/revísalas con tu asesor/)).toBeOnTheScreen();
  });
});
