import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import { useSessionStore } from '@/shared/auth/session-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import { findApiCall, mockApi } from '@/test/mock-api';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { AdminMoreScreen } from './AdminMoreScreen';
import { CenterDetailsScreen } from './CenterDetailsScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const SETTINGS_PATH = `/v1/centers/${NORTE_CENTER_ID}`;
const SETTINGS = {
  id: NORTE_CENTER_ID,
  name: 'Studio Norte',
  sectorId: 'yoga',
  timezone: 'Europe/Madrid',
  address: 'Calle Mayor 1',
  phone: null,
  contactEmail: null,
  legalName: null,
  taxId: null,
  taxAddress: null,
  openingHours: null,
  holidays: [{ date: '2026-12-25', label: 'Navidad' }],
  version: '"v1"',
};

function signInAsOwner(): void {
  act(() => {
    useSessionStore.getState().startSession({ accessToken: 'token', user: null });
    useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
  });
}

describe('AdminMoreScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    signInAsOwner();
    mockApi({ 'GET /v1/me/memberships': { memberships: [] } });
  });

  it('groups the accesses and opens the center details', () => {
    renderScreen(<AdminMoreScreen />);

    expect(screen.getByText('Tu centro')).toBeOnTheScreen();
    expect(screen.getByText('Equipo')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: /Datos del centro y horario/ }));

    expect(getMockRouter().push).toHaveBeenCalledWith('/(admin)/center');
  });

  it('offers the dark theme switch and signing out', () => {
    renderScreen(<AdminMoreScreen />);

    expect(screen.getByLabelText('Tema oscuro')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeOnTheScreen();
  });
});

describe('CenterDetailsScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    signInAsOwner();
  });

  it('shows what is saved, including the closures', async () => {
    mockApi({ [`GET ${SETTINGS_PATH}`]: SETTINGS });
    renderScreen(<CenterDetailsScreen />);

    expect(await screen.findByDisplayValue('Calle Mayor 1')).toBeOnTheScreen();
    expect(screen.getByText('Navidad')).toBeOnTheScreen();
  });

  it('refuses a tax id with the wrong format without calling the server', async () => {
    mockApi({ [`GET ${SETTINGS_PATH}`]: SETTINGS });
    renderScreen(<CenterDetailsScreen />);

    fireEvent.changeText(await screen.findByLabelText('CIF / NIF'), '12');
    fireEvent.press(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(await screen.findByText('Revisa el formato (ej. B12345678)')).toBeOnTheScreen();
    expect(findApiCall('PATCH', SETTINGS_PATH)).toBeUndefined();
  });

  it('saves the details with the version it read and goes back', async () => {
    mockApi({
      [`GET ${SETTINGS_PATH}`]: SETTINGS,
      [`PATCH ${SETTINGS_PATH}`]: { ...SETTINGS, taxId: 'B12345678' },
    });
    renderScreen(<CenterDetailsScreen />);

    fireEvent.changeText(await screen.findByLabelText('CIF / NIF'), 'b12345678');
    fireEvent.press(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => {
      expect(findApiCall('PATCH', SETTINGS_PATH)?.body).toMatchObject({
        taxId: 'b12345678',
        sectorId: 'yoga',
        phone: null,
      });
    });
  });
});
