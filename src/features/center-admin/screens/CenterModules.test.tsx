import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import { apiMutator } from '@/shared/api/api-mutator';
import { useSessionStore } from '@/shared/auth/session-store';
import { ALL_MODULES_ON, buildMembership, NO_APPEARANCE, NORTE_CENTER_ID } from '@/test/factories';
import { findApiCall, mockApi } from '@/test/mock-api';
import { renderScreen } from '@/test/render-screen';

import { AdminMoreScreen } from './AdminMoreScreen';
import { CenterModulesScreen } from './CenterModulesScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const SETTINGS_PATH = `/v1/centers/${NORTE_CENTER_ID}`;
const SETTINGS = {
  id: NORTE_CENTER_ID,
  name: 'Taller Norte',
  sectorId: 'otro',
  modules: ALL_MODULES_ON,
  version: '"v1"',
};

function signInAsOwner(): void {
  act(() => {
    useSessionStore.getState().startSession({ accessToken: 'token', user: null });
    useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
  });
}

describe('CenterModulesScreen', () => {
  beforeEach(signInAsOwner);

  it('shows what the center uses and turns a module off with the version it read', async () => {
    mockApi({
      [`GET ${SETTINGS_PATH}`]: SETTINGS,
      [`PATCH ${SETTINGS_PATH}`]: { ...SETTINGS, modules: { ...ALL_MODULES_ON, passes: false } },
      'GET /v1/me/memberships': { memberships: [] },
    });
    renderScreen(<CenterModulesScreen />);

    const passesSwitch = await screen.findByRole('switch', { name: 'Bonos' });
    expect(passesSwitch).toBeOnTheScreen();
    expect(screen.getByRole('switch', { name: 'Lista de espera' })).toBeOnTheScreen();
    fireEvent(passesSwitch, 'valueChange', false);

    await waitFor(() => {
      expect(findApiCall('PATCH', SETTINGS_PATH)?.body).toEqual({ modules: { passes: false } });
    });
    const patchRequest = jest
      .mocked(apiMutator)
      .mock.calls.find(([, init]) => init.method === 'PATCH')?.[1];
    expect(patchRequest?.headers).toMatchObject({ 'If-Match': '"v1"' });
  });
});

describe('AdminMoreScreen · módulos apagados', () => {
  beforeEach(signInAsOwner);

  it('hides the passes and routines shortcuts of a center that turned them off', async () => {
    mockApi({
      'GET /v1/me/memberships': {
        memberships: [
          buildMembership({
            role: 'owner',
            center: {
              name: 'Taller Norte',
              slug: 'taller-norte',
              sectorId: 'otro',
              brandColor: '#E4572E',
              logoUrl: null,
              modules: { ...ALL_MODULES_ON, passes: false, content: false },
              appearance: NO_APPEARANCE,
            },
          }),
        ],
      },
    });
    renderScreen(<AdminMoreScreen />);

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Bonos/ })).not.toBeOnTheScreen();
    });
    expect(
      screen.queryByRole('button', { name: /Rutinas|Tareas|Prácticas/ }),
    ).not.toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: /Más ajustes/ }));
    expect(screen.getByRole('button', { name: /Módulos del centro/ })).toBeOnTheScreen();
  });
});
