import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { ImageManipulator } from 'expo-image-manipulator';
import { launchImageLibraryAsync } from 'expo-image-picker';

import { findApiCall, mockApi, buildApiError } from '@/test/mock-api';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { useCreatedCenterStore } from '../model/created-center-store';
import { CenterLogoScreen } from './CenterLogoScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));
jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: jest.fn() }));
jest.mock('expo-image-manipulator', () => ({
  SaveFormat: { PNG: 'png' },
  ImageManipulator: { manipulate: jest.fn() },
}));

const CENTER_ID = '0b0cbd0e-7f87-4c43-a5ec-9f5a0b6b5c11';
const SMALL_PNG_BASE64 = 'iVBORw0KGgo=';

function mockChosenImage(base64: string): void {
  jest.mocked(launchImageLibraryAsync).mockResolvedValue({
    canceled: false,
    assets: [{ uri: 'file:///galeria/logo.jpg', width: 1000, height: 1000 }],
  });
  (ImageManipulator.manipulate as jest.Mock).mockReturnValue({
    resize: jest.fn(),
    renderAsync: jest.fn().mockResolvedValue({
      saveAsync: jest.fn().mockResolvedValue({ uri: 'file:///cache/logo-512.png', base64 }),
    }),
  });
}

describe('CenterLogoScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    act(() => {
      useCreatedCenterStore.getState().saveCreatedCenter({
        centerId: CENTER_ID,
        name: 'Vértice Training',
        brandColor: '#7A3FE0',
        joinCode: 'VERTI9',
      });
    });
  });

  it('goes to the root when no center was just created', () => {
    act(() => {
      useCreatedCenterStore.getState().clearCreatedCenter();
    });
    renderScreen(<CenterLogoScreen />);

    expect(screen.getByText('redirect:/')).toBeOnTheScreen();
  });

  it('previews the center with its initials until a logo is chosen', () => {
    renderScreen(<CenterLogoScreen />);

    expect(
      screen.getByRole('img', { name: 'Vista previa del logo de Vértice Training' }),
    ).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Elegir logo de la galería' })).toBeOnTheScreen();
  });

  it('lets the owner skip the logo', () => {
    renderScreen(<CenterLogoScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Ahora no' }));

    expect(getMockRouter().replace).toHaveBeenCalledWith('/(onboarding)/done');
  });

  it('uploads the chosen logo as a 512 px PNG and goes to the final screen', async () => {
    mockApi({
      [`PUT /v1/onboarding/centers/${CENTER_ID}/logo`]: {
        logoUrl: `/v1/centers/${CENTER_ID}/logo?v=1`,
      },
      'GET /v1/me/memberships': { memberships: [] },
    });
    mockChosenImage(SMALL_PNG_BASE64);
    renderScreen(<CenterLogoScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Elegir logo de la galería' }));
    fireEvent.press(await screen.findByRole('button', { name: 'Usar este logo' }));

    await waitFor(() => {
      expect(getMockRouter().replace).toHaveBeenCalledWith('/(onboarding)/done');
    });
    expect(findApiCall('PUT', `/v1/onboarding/centers/${CENTER_ID}/logo`)?.body).toEqual({
      contentType: 'image/png',
      dataBase64: SMALL_PNG_BASE64,
    });
  });

  it('refuses an image that is too large before uploading it', async () => {
    mockApi({});
    mockChosenImage('A'.repeat(1_000_000));
    renderScreen(<CenterLogoScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Elegir logo de la galería' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/Esa imagen es demasiado grande/);
    expect(screen.queryByRole('button', { name: 'Usar este logo' })).not.toBeOnTheScreen();
  });

  it('shows the server error and stays on the screen when the upload fails', async () => {
    mockApi({
      [`PUT /v1/onboarding/centers/${CENTER_ID}/logo`]: () => {
        throw buildApiError('LOGO_INVALID', 422);
      },
    });
    mockChosenImage(SMALL_PNG_BASE64);
    renderScreen(<CenterLogoScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Elegir logo de la galería' }));
    fireEvent.press(await screen.findByRole('button', { name: 'Usar este logo' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/Ese archivo no es un logo válido/);
    expect(getMockRouter().replace).not.toHaveBeenCalled();
  });
});
