import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import { useSessionStore } from '@/shared/auth/session-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import { buildApiError, findApiCall, mockApi } from '@/test/mock-api';
import { resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { BrandScreen } from './BrandScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const CENTER_PATH = `/v1/centers/${NORTE_CENTER_ID}`;
const SETTINGS = {
  id: NORTE_CENTER_ID,
  slug: 'studio-norte',
  name: 'Studio Norte',
  sectorId: 'estudio',
  brandColor: '#E4572E',
  timezone: 'Europe/Madrid',
  joinCode: 'NORTE7',
  status: 'trial',
  isListed: false,
  city: null,
  address: null,
  latitude: null,
  longitude: null,
  openingHours: null,
  holidays: null,
  cancelPolicy: null,
  trialEndsAt: null,
  version: 'W/"version-1"',
};

function mockBrandApi(overrides: Record<string, unknown> = {}): void {
  mockApi({
    [`GET ${CENTER_PATH}`]: SETTINGS,
    [`PATCH ${CENTER_PATH}`]: { ...SETTINGS, version: 'W/"version-2"' },
    [`GET ${CENTER_PATH}/services`]: { services: [] },
    [`GET ${CENTER_PATH}/team`]: { members: [] },
    ...overrides,
  });
}

async function renderLoadedBrandScreen(): Promise<void> {
  renderScreen(<BrandScreen />);
  await screen.findByDisplayValue('Studio Norte');
  // Las cifras de «Servicios, horario y equipo» llegan aparte: se espera para no dejar peticiones sueltas.
  await screen.findByText(/^0 servicios/);
}

describe('BrandScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    act(() => {
      useSessionStore.getState().startSession({ accessToken: 'token', user: null });
      useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
    });
  });

  it('shows the published name, the color groups and the contrast report', async () => {
    mockBrandApi();
    await renderLoadedBrandScreen();

    expect(screen.getByDisplayValue('Studio Norte')).toBeOnTheScreen();
    expect(screen.getByText('Vivos')).toBeOnTheScreen();
    expect(screen.getByText('Pastel')).toBeOnTheScreen();
    expect(screen.getByText('Metalizados')).toBeOnTheScreen();
    expect(screen.getByRole('heading', { name: 'Contraste accesible' })).toBeOnTheScreen();
  });

  it('keeps Publicar cambios disabled until something changes', async () => {
    mockBrandApi();
    await renderLoadedBrandScreen();

    expect(screen.getByRole('button', { name: 'Publicar cambios' })).toBeDisabled();
  });

  it('publishes only the color that changed', async () => {
    mockBrandApi();
    await renderLoadedBrandScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Color #A9D6E5' }));
    fireEvent.press(screen.getByRole('button', { name: 'Publicar cambios' }));

    await waitFor(() => {
      expect(findApiCall('PATCH', CENTER_PATH)?.body).toEqual({ brandColor: '#A9D6E5' });
    });
    expect(
      await screen.findByText('Publicado. Tus clientes ya ven la nueva marca.'),
    ).toBeOnTheScreen();
  });

  it('does not let a one-letter name be published', async () => {
    mockBrandApi();
    await renderLoadedBrandScreen();
    fireEvent.changeText(screen.getByDisplayValue('Studio Norte'), 'S');

    expect(screen.getByText('El nombre debe tener entre 2 y 80 caracteres')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Publicar cambios' })).toBeDisabled();
  });

  it('opens the color selector with the hexadecimal field', async () => {
    mockBrandApi();
    await renderLoadedBrandScreen();

    fireEvent.press(
      screen.getByRole('button', { name: 'Selector de color y color personalizado' }),
    );

    expect(screen.getByLabelText('Color en hexadecimal')).toBeOnTheScreen();
  });

  it('offers a retry when the settings cannot be loaded', async () => {
    mockBrandApi({
      [`GET ${CENTER_PATH}`]: () => {
        throw buildApiError('MFA_REQUIRED', 403);
      },
    });
    renderScreen(<BrandScreen />);

    expect(await screen.findByText('No hemos podido cargar tu marca')).toBeOnTheScreen();
  });
});
