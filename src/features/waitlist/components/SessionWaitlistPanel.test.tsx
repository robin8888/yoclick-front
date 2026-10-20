import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import { useSessionStore } from '@/shared/auth/session-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import { findApiCall, mockApi } from '@/test/mock-api';
import { renderScreen } from '@/test/render-screen';

import { SessionWaitlistPanel } from './SessionWaitlistPanel';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const SESSION_ID = '0191d6a0-0000-7000-8000-0000000000c1';
const WAITLIST_PATH = `/v1/centers/${NORTE_CENTER_ID}/class-sessions/${SESSION_ID}/waitlist`;

function buildPerson(overrides: Record<string, unknown>): Record<string, unknown> {
  return {
    id: '0191d6a0-0000-7000-8000-0000000000d1',
    status: 'waiting',
    createdAt: '2026-10-19T10:00:00.000Z',
    position: 1,
    offerExpiresAt: null,
    client: { membershipId: '0191d6a0-0000-7000-8000-0000000000e1', fullName: 'Marco Gil' },
    ...overrides,
  };
}

describe('SessionWaitlistPanel', () => {
  beforeEach(() => {
    act(() => {
      useSessionStore.getState().startSession({ accessToken: 'token', user: null });
      useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
    });
  });

  it('lists who waits, with the offered seat and the queue place in words', async () => {
    mockApi({
      [`GET ${WAITLIST_PATH}`]: {
        entries: [
          buildPerson({
            id: '0191d6a0-0000-7000-8000-0000000000d2',
            status: 'offered',
            position: null,
            offerExpiresAt: '2026-10-22T16:30:00.000Z',
            client: { membershipId: '0191d6a0-0000-7000-8000-0000000000e2', fullName: 'Eva Ruiz' },
          }),
          buildPerson({}),
        ],
      },
    });
    renderScreen(<SessionWaitlistPanel classSessionId={SESSION_ID} timeZone="Europe/Madrid" />);

    expect(await screen.findByRole('heading', { name: 'Lista de espera (2)' })).toBeOnTheScreen();
    expect(screen.getByText('Eva Ruiz')).toBeOnTheScreen();
    expect(screen.getByText(/Plaza ofrecida · confirma antes del/)).toBeOnTheScreen();
    expect(screen.getByText('Marco Gil')).toBeOnTheScreen();
    expect(screen.getByText('En lista de espera · puesto 1')).toBeOnTheScreen();
  });

  it('takes no room when nobody waits', async () => {
    mockApi({ [`GET ${WAITLIST_PATH}`]: { entries: [] } });
    renderScreen(<SessionWaitlistPanel classSessionId={SESSION_ID} timeZone="Europe/Madrid" />);

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.queryByRole('heading')).not.toBeOnTheScreen();
  });

  it('removes a person from the waitlist after confirming it', async () => {
    const entryId = '0191d6a0-0000-7000-8000-0000000000d1';
    mockApi({
      [`GET ${WAITLIST_PATH}`]: { entries: [buildPerson({ id: entryId })] },
      [`DELETE ${WAITLIST_PATH}/${entryId}`]: undefined,
    });
    renderScreen(<SessionWaitlistPanel classSessionId={SESSION_ID} timeZone="Europe/Madrid" />);

    fireEvent.press(
      await screen.findByRole('button', { name: 'Quitar de la lista de espera a Marco Gil' }),
    );
    expect(findApiCall('DELETE', `${WAITLIST_PATH}/${entryId}`)).toBeUndefined();
    fireEvent.press(screen.getByRole('button', { name: 'Sí, quitar' }));

    await waitFor(() => {
      expect(findApiCall('DELETE', `${WAITLIST_PATH}/${entryId}`)).toBeDefined();
    });
  });
});
