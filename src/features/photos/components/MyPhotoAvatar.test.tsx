import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import { useSessionStore } from '@/shared/auth/session-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import { findApiCall, mockApi } from '@/test/mock-api';
import { renderScreen } from '@/test/render-screen';

import { MyPhotoAvatar } from './MyPhotoAvatar';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
}));
jest.mock('expo-image-manipulator', () => ({
  ImageManipulator: { manipulate: jest.fn() },
  SaveFormat: { JPEG: 'jpeg' },
}));

const PROFILE = { fullName: 'Marta Gil', email: 'marta@example.com', locale: 'es-ES' };

function signIn(): void {
  act(() => {
    useSessionStore.getState().startSession({ accessToken: 'token', user: null });
    useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
  });
}

describe('MyPhotoAvatar', () => {
  beforeEach(signIn);

  it('offers to take or choose a photo, and nothing to remove when there is none', async () => {
    mockApi({ 'GET /v1/me': { ...PROFILE, photoUrl: null } });
    renderScreen(<MyPhotoAvatar name="Marta Gil" />);

    fireEvent.press(await screen.findByRole('button', { name: 'Añadir foto de perfil' }));

    expect(await screen.findByRole('button', { name: 'Hacer foto' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Elegir de la galería' })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Quitar foto' })).not.toBeOnTheScreen();
  });

  it('removes the photo, so the initials come back', async () => {
    mockApi({
      'GET /v1/me': { ...PROFILE, photoUrl: 'https://cdn.example/foto.jpg' },
      'DELETE /v1/me/photo': null,
    });
    renderScreen(<MyPhotoAvatar name="Marta Gil" />);

    fireEvent.press(await screen.findByRole('button', { name: 'Cambiar foto de perfil' }));
    fireEvent.press(await screen.findByRole('button', { name: 'Quitar foto' }));

    await waitFor(() => {
      expect(findApiCall('DELETE', '/v1/me/photo')).toBeDefined();
    });
  });
});
