import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import { useSessionStore } from '@/shared/auth/session-store';
import { ALL_MODULES_ON, buildMembership, NORTE_CENTER_ID } from '@/test/factories';
import { findApiCall, mockApi } from '@/test/mock-api';
import { renderScreen } from '@/test/render-screen';

import { AutoStartSwitch } from './AutoStartSwitch';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const SETTINGS_PATH = `/v1/centers/${NORTE_CENTER_ID}`;
const SETTINGS = { id: NORTE_CENTER_ID, autoStartSessions: false, version: '"v1"' };

function mockCenterWithRooms(hasRooms: boolean): void {
  mockApi({
    'GET /v1/me/memberships': {
      memberships: [
        buildMembership({
          role: 'owner',
          center: {
            ...buildMembership().center,
            modules: { ...ALL_MODULES_ON, rooms: hasRooms },
          },
        }),
      ],
    },
    [`GET ${SETTINGS_PATH}`]: SETTINGS,
    [`PATCH ${SETTINGS_PATH}`]: { ...SETTINGS, autoStartSessions: true },
  });
}

describe('AutoStartSwitch', () => {
  beforeEach(() => {
    act(() => {
      useSessionStore.getState().startSession({ accessToken: 'token', user: null });
      useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
    });
  });

  it('talks about classes in a center with classes', async () => {
    mockCenterWithRooms(true);
    renderScreen(<AutoStartSwitch />);

    expect(await screen.findByText('Iniciar las clases automáticamente')).toBeOnTheScreen();
  });

  it('talks about services in a center that only gives appointments', async () => {
    mockCenterWithRooms(false);
    renderScreen(<AutoStartSwitch />);

    expect(await screen.findByText('Iniciar los servicios automáticamente')).toBeOnTheScreen();
  });

  it('turns it on with the version it read', async () => {
    mockCenterWithRooms(true);
    renderScreen(<AutoStartSwitch />);

    fireEvent(
      await screen.findByRole('switch', { name: /Iniciar las clases/ }),
      'valueChange',
      true,
    );

    await waitFor(() => {
      expect(findApiCall('PATCH', SETTINGS_PATH)?.body).toEqual({ autoStartSessions: true });
    });
  });
});
