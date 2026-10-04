import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { useCameraPermissions } from 'expo-camera';
import { Linking } from 'react-native';

import { apiMutator } from '@/shared/api/api-mutator';
import { NORTE_CENTER_ID } from '@/test/factories';
import { mockApi } from '@/test/mock-api';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { usePendingCenterStore } from '../model/pending-center-store';
import { JoinScanScreen } from './JoinScanScreen';

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

const mockedUseCameraPermissions = jest.mocked(useCameraPermissions);
const requestCameraPermission = jest.fn();

function givenCameraPermission(permission: { granted: boolean; canAskAgain: boolean }): void {
  mockedUseCameraPermissions.mockReturnValue([
    permission as never,
    requestCameraPermission,
    jest.fn(),
  ]);
}

function scanQr(qrContent: string): void {
  act(() => {
    latestCameraProps.onBarcodeScanned?.({ data: qrContent });
  });
}

const NORTE_PUBLIC_CENTER = {
  id: NORTE_CENTER_ID,
  name: 'Studio Norte',
  slug: 'studio-norte',
  sectorId: 'estudio',
  brandColor: '#E4572E',
  city: [],
};

describe('JoinScanScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    requestCameraPermission.mockReset();
    latestCameraProps = {};
    usePendingCenterStore.getState().clearPendingCenter();
  });

  it('explains why the camera is needed and asks for permission on demand', () => {
    givenCameraPermission({ granted: false, canAskAgain: true });
    renderScreen(<JoinScanScreen />);

    expect(screen.getByText(/Usamos la cámara solo mientras escaneas/)).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Permitir la cámara' }));

    expect(requestCameraPermission).toHaveBeenCalledTimes(1);
  });

  it('sends the user to Settings when the system will not ask again', () => {
    const openSettingsSpy = jest.spyOn(Linking, 'openSettings').mockResolvedValue();
    givenCameraPermission({ granted: false, canAskAgain: false });
    renderScreen(<JoinScanScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Abrir ajustes' }));

    expect(openSettingsSpy).toHaveBeenCalledTimes(1);
  });

  it('finds the center of a valid join link QR and goes to confirm it', async () => {
    mockApi({ 'GET /v1/join/code/NORTE7': NORTE_PUBLIC_CENTER });
    givenCameraPermission({ granted: true, canAskAgain: true });
    renderScreen(<JoinScanScreen />);

    scanQr('https://yoclick.app/j/NORTE7');

    await waitFor(() => {
      expect(getMockRouter().push).toHaveBeenCalledWith(`/join/${NORTE_CENTER_ID}`);
    });
  });

  it('rejects a QR that is not a Yoclick join link without calling the API', () => {
    jest.mocked(apiMutator).mockReset();
    givenCameraPermission({ granted: true, canAskAgain: true });
    renderScreen(<JoinScanScreen />);

    scanQr('https://evil.example/j/NORTE7');

    expect(screen.getByText(/Este QR no es de un centro de Yoclick/)).toBeOnTheScreen();
    expect(apiMutator).not.toHaveBeenCalled();
  });

  it('offers the code entry as an alternative', () => {
    givenCameraPermission({ granted: true, canAskAgain: true });
    renderScreen(<JoinScanScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Tengo un código' }));

    expect(getMockRouter().replace).toHaveBeenCalledWith('/join/code');
  });
});
