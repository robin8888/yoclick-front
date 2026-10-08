import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { useCameraPermissions } from 'expo-camera';

import { usePendingCenterStore } from '@/features/join';
import { NORTE_CENTER_ID } from '@/test/factories';
import { buildApiError, mockApi } from '@/test/mock-api';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { AccessScanScreen } from './AccessScanScreen';
import { InviteCodeScreen } from './InviteCodeScreen';
import { LoginScreen } from './LoginScreen';
import { StartScreen } from './StartScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

interface CameraProps {
  onBarcodeScanned?: (scanResult: { data: string }) => void;
}
let latestCameraProps: CameraProps = {};

jest.mock('expo-camera', () => ({
  useCameraPermissions: jest.fn(),
  CameraView: (cameraProps: CameraProps) => {
    latestCameraProps = cameraProps;
    return null;
  },
}));

const NORTE_PUBLIC_CENTER = {
  id: NORTE_CENTER_ID,
  name: 'Studio Norte',
  slug: 'studio-norte',
  sectorId: 'estudio',
  brandColor: '#E4572E',
  city: [],
};

function resetAccess(): void {
  resetMockRouter();
  latestCameraProps = {};
  act(() => {
    usePendingCenterStore.getState().clearPendingCenter();
  });
  jest
    .mocked(useCameraPermissions)
    .mockReturnValue([{ granted: true, canAskAgain: true } as never, jest.fn(), jest.fn()]);
}

function scanQr(qrContent: string): void {
  act(() => {
    latestCameraProps.onBarcodeScanned?.({ data: qrContent });
  });
}

describe('StartScreen · otras formas de entrar', () => {
  beforeEach(resetAccess);

  it('offers to scan the QR of the center without an account', () => {
    renderScreen(<StartScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Escanear el QR de mi centro' }));

    expect(getMockRouter().push).toHaveBeenCalledWith('/(auth)/scan');
  });

  it('becomes the center’s screen once its QR or code was used, and lets the person undo it', () => {
    act(() => {
      usePendingCenterStore.getState().selectPendingCenter({
        id: NORTE_CENTER_ID,
        name: 'Studio Norte',
        sectorId: 'estudio',
        brandHexColor: '#E4572E',
        logoUrl: null,
      });
    });
    renderScreen(<StartScreen />);

    expect(screen.getByText('Te han invitado a Studio Norte')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Escanear el QR de mi centro' })).toBeNull();

    fireEvent.press(screen.getByRole('button', { name: 'No es mi centro' }));

    expect(usePendingCenterStore.getState().pendingCenter).toBeNull();
  });
});

describe('AccessScanScreen', () => {
  beforeEach(resetAccess);

  it('treats the QR of Invita a tus alumnos as the center code: keeps the center and goes to sign up', async () => {
    mockApi({ 'GET /v1/join/code/NORTE7': NORTE_PUBLIC_CENTER });
    renderScreen(<AccessScanScreen />);

    scanQr('https://yoclick.app/j/NORTE7');

    await waitFor(() => {
      expect(getMockRouter().replace).toHaveBeenCalledWith('/(auth)/register');
    });
    expect(usePendingCenterStore.getState().pendingCenter).toMatchObject({
      id: NORTE_CENTER_ID,
      name: 'Studio Norte',
      joinCode: 'NORTE7',
      joinSource: 'qr',
    });
  });

  it('rejects a QR that is not from a Yoclick center', () => {
    renderScreen(<AccessScanScreen />);

    scanQr('https://evil.example/j/NORTE7');

    expect(screen.getByText(/Este QR no es de un centro de Yoclick/)).toBeOnTheScreen();
    expect(getMockRouter().replace).not.toHaveBeenCalled();
  });
});

describe('InviteCodeScreen · código corto del centro', () => {
  beforeEach(resetAccess);

  it('accepts the short code of the center like the QR does', async () => {
    mockApi({ 'GET /v1/join/code/NORTE7': NORTE_PUBLIC_CENTER });
    renderScreen(<InviteCodeScreen />);

    fireEvent.changeText(screen.getByLabelText('Código del centro o de invitación'), 'norte7');
    fireEvent.press(screen.getByRole('button', { name: 'Continuar' }));

    await waitFor(() => {
      expect(getMockRouter().replace).toHaveBeenCalledWith('/(auth)/register');
    });
    expect(usePendingCenterStore.getState().pendingCenter).toMatchObject({
      id: NORTE_CENTER_ID,
      joinCode: 'NORTE7',
    });
  });

  it('explains a center code that does not exist', async () => {
    mockApi({
      'GET /v1/join/code/NOEXISTE': () => {
        throw buildApiError('NOT_FOUND', 404);
      },
    });
    renderScreen(<InviteCodeScreen />);

    fireEvent.changeText(screen.getByLabelText('Código del centro o de invitación'), 'NOEXISTE');
    fireEvent.press(screen.getByRole('button', { name: 'Continuar' }));

    expect(await screen.findByRole('alert')).toBeOnTheScreen();
    expect(usePendingCenterStore.getState().pendingCenter).toBeNull();
  });
});

describe('LoginScreen · tras el QR del centro', () => {
  beforeEach(resetAccess);

  it('names the center and the role', () => {
    act(() => {
      usePendingCenterStore.getState().selectPendingCenter({
        id: NORTE_CENTER_ID,
        name: 'Studio Norte',
        sectorId: 'estudio',
        brandHexColor: '#E4572E',
        logoUrl: null,
      });
    });
    renderScreen(<LoginScreen />);

    expect(
      screen.getByText('Inicia sesión para entrar en Studio Norte como cliente.'),
    ).toBeOnTheScreen();
  });
});
