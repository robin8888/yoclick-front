import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import { useSessionStore } from '@/shared/auth/session-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import { findApiCall, mockApi } from '@/test/mock-api';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { InviteClientsScreen } from './InviteClientsScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));
jest.mock('expo-clipboard', () => ({ setStringAsync: jest.fn(() => Promise.resolve(true)) }));

const SETTINGS_PATH = `/v1/centers/${NORTE_CENTER_ID}`;
const STATS_PATH = `/v1/centers/${NORTE_CENTER_ID}/join-stats`;
const REGENERATE_PATH = `/v1/centers/${NORTE_CENTER_ID}/join-code/regenerate`;
const SETTINGS = { id: NORTE_CENTER_ID, name: 'Studio Norte', joinCode: 'NORTE7', version: '"v1"' };
const STATS = { month: '2026-10', qr: 12, link: 20, code: 6, search: 0, total: 38 };

function signInAsOwner(): void {
  act(() => {
    useSessionStore.getState().startSession({ accessToken: 'token', user: null });
    useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
  });
}

describe('InviteClientsScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    signInAsOwner();
    mockApi({
      [`GET ${SETTINGS_PATH}`]: SETTINGS,
      [`GET ${STATS_PATH}`]: STATS,
      'GET /v1/me/memberships': { memberships: [] },
    });
  });

  it('shows the code, the link and this month joins by where they came from', async () => {
    renderScreen(<InviteClientsScreen />);

    expect(await screen.findByText('NORTE7')).toBeOnTheScreen();
    expect(screen.getByText('https://yoclick.app/j/NORTE7')).toBeOnTheScreen();
    expect(await screen.findByLabelText('12 por QR')).toBeOnTheScreen();
    expect(screen.getByLabelText('20 por enlace')).toBeOnTheScreen();
    expect(screen.getByLabelText('6 por código')).toBeOnTheScreen();
    expect(screen.getByText(/38 .* nuevos este mes/)).toBeOnTheScreen();
  });

  it('opens the reception poster', async () => {
    renderScreen(<InviteClientsScreen />);

    fireEvent.press(await screen.findByRole('button', { name: /Cartel para recepción/ }));

    expect(getMockRouter().push).toHaveBeenCalledWith('/(admin)/poster');
  });

  it('asks before changing the code, and only then calls the server', async () => {
    mockApi({
      [`GET ${SETTINGS_PATH}`]: SETTINGS,
      [`GET ${STATS_PATH}`]: STATS,
      [`POST ${REGENERATE_PATH}`]: { joinCode: 'ABCD23' },
    });
    renderScreen(<InviteClientsScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Cambiar el código del centro' }));
    expect(findApiCall('POST', REGENERATE_PATH)).toBeUndefined();
    expect(await screen.findByText('¿Cambiar el código?')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Cambiar código' }));

    await waitFor(() => {
      expect(findApiCall('POST', REGENERATE_PATH)).toBeDefined();
    });
  });
});
