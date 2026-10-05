import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { useCameraPermissions } from 'expo-camera';

import { useSessionStore } from '@/shared/auth/session-store';
import { buildBooking } from '@/test/booking-factories';
import { NORTE_CENTER_ID } from '@/test/factories';
import { buildApiError, findApiCall, getRecordedApiCalls, mockApi } from '@/test/mock-api';
import { resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { AccessQrScreen } from './AccessQrScreen';
import { ScanAttendanceScreen } from './ScanAttendanceScreen';

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

const CODE_PATH = `/v1/centers/${NORTE_CENTER_ID}/me/checkin-code`;
const CHECK_IN_PATH = `/v1/centers/${NORTE_CENTER_ID}/attendance/check-in`;
const QR_CONTENT = 'yoclick:checkin:aaa.bbb.ccc';

function signInToCenter(): void {
  act(() => {
    useSessionStore.getState().startSession({ accessToken: 'token', user: null });
    useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
  });
}

function countCheckInCalls(): number {
  return getRecordedApiCalls().filter(
    (call) => call.method === 'POST' && call.path === CHECK_IN_PATH,
  ).length;
}

function scanQr(qrContent: string): void {
  act(() => {
    latestCameraProps.onBarcodeScanned?.({ data: qrContent });
  });
}

describe('AccessQrScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    signInToCenter();
  });

  it('shows the QR signed by the server, exactly as received', async () => {
    mockApi({
      [`POST ${CODE_PATH}`]: {
        qrContent: QR_CONTENT,
        expiresAt: new Date(Date.now() + 300_000).toISOString(),
      },
    });
    renderScreen(<AccessQrScreen />);

    expect(await screen.findByRole('img', { name: 'Código QR de asistencia' })).toBeOnTheScreen();
    expect(screen.getByText('Se actualiza solo. No lo compartas: es personal.')).toBeOnTheScreen();
  });

  it('shows an error with retry when the code cannot be generated', async () => {
    mockApi({
      [`POST ${CODE_PATH}`]: () => {
        throw buildApiError('INTERNAL_ERROR', 500);
      },
    });
    renderScreen(<AccessQrScreen />);

    expect(await screen.findByText('No hemos podido generar tu QR')).toBeOnTheScreen();
  });
});

describe('ScanAttendanceScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    signInToCenter();
    latestCameraProps = {};
    jest
      .mocked(useCameraPermissions)
      .mockReturnValue([{ granted: true, canAskAgain: true } as never, jest.fn(), jest.fn()]);
  });

  it('registers the arrival of the scanned person and says who and for which appointment', async () => {
    mockApi({
      [`POST ${CHECK_IN_PATH}`]: {
        clientFullName: 'Lucía Torres',
        checkedInAt: new Date().toISOString(),
        isFirstCheckIn: true,
        booking: buildBooking(),
      },
    });
    renderScreen(<ScanAttendanceScreen />);

    scanQr(QR_CONTENT);

    expect(await screen.findByText('Lucía Torres')).toBeOnTheScreen();
    expect(screen.getByText('Asistencia registrada')).toBeOnTheScreen();
    expect(screen.getByText('Entrenamiento personal · 18:00')).toBeOnTheScreen();
    expect(findApiCall('POST', CHECK_IN_PATH)?.body).toEqual({ qrContent: QR_CONTENT });
  });

  it('says so with a word when the arrival was already registered', async () => {
    mockApi({
      [`POST ${CHECK_IN_PATH}`]: {
        clientFullName: 'Lucía Torres',
        checkedInAt: new Date().toISOString(),
        isFirstCheckIn: false,
        booking: buildBooking(),
      },
    });
    renderScreen(<ScanAttendanceScreen />);

    scanQr(QR_CONTENT);

    expect(await screen.findByText('Ya estaba registrada')).toBeOnTheScreen();
  });

  it('shows the server problem and lets the same QR be scanned again', async () => {
    mockApi({
      [`POST ${CHECK_IN_PATH}`]: () => {
        throw buildApiError('CHECKIN_NO_BOOKING', 409);
      },
    });
    renderScreen(<ScanAttendanceScreen />);

    scanQr(QR_CONTENT);
    expect(await screen.findByRole('alert')).toBeOnTheScreen();
    scanQr(QR_CONTENT);

    await waitFor(() => {
      expect(countCheckInCalls()).toBe(2);
    });
  });

  it('only processes a QR once while the camera repeats the same reading', async () => {
    mockApi({
      [`POST ${CHECK_IN_PATH}`]: {
        clientFullName: 'Lucía Torres',
        checkedInAt: new Date().toISOString(),
        isFirstCheckIn: true,
        booking: buildBooking(),
      },
    });
    renderScreen(<ScanAttendanceScreen />);

    scanQr(QR_CONTENT);
    scanQr(QR_CONTENT);
    scanQr(QR_CONTENT);

    await screen.findByText('Lucía Torres');
    expect(countCheckInCalls()).toBe(1);
    fireEvent.press(screen.getByRole('button', { name: 'Escanear otro' }));
    expect(await screen.findByText('Apunta al QR que te enseña la persona')).toBeOnTheScreen();
  });
});
