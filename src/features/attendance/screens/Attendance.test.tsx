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
import { WorkQrScreen } from './WorkQrScreen';

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
      [`GET /v1/centers/${NORTE_CENTER_ID}/bookings/mine`]: { bookings: [buildBooking()] },
    });
    renderScreen(<AccessQrScreen />);

    expect(await screen.findByRole('img', { name: 'Código QR de asistencia' })).toBeOnTheScreen();
    expect(screen.getByText(/El código se renueva solo cada pocos minutos/)).toBeOnTheScreen();
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
        kind: 'client',
        person: {
          membershipId: 'client-1',
          fullName: 'Lucía Torres',
          photoUrl: null,
          role: 'client',
        },
        access: {
          isGranted: true,
          reason: 'valid_pass',
          pass: {
            name: 'Bono 10 clases',
            remainingSessions: 6,
            totalSessions: 10,
            expiresAt: null,
          },
        },
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
        kind: 'client',
        person: {
          membershipId: 'client-1',
          fullName: 'Lucía Torres',
          photoUrl: null,
          role: 'client',
        },
        access: {
          isGranted: true,
          reason: 'valid_pass',
          pass: {
            name: 'Bono 10 clases',
            remainingSessions: 6,
            totalSessions: 10,
            expiresAt: null,
          },
        },
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
        kind: 'client',
        person: {
          membershipId: 'client-1',
          fullName: 'Lucía Torres',
          photoUrl: null,
          role: 'client',
        },
        access: {
          isGranted: true,
          reason: 'valid_pass',
          pass: {
            name: 'Bono 10 clases',
            remainingSessions: 6,
            totalSessions: 10,
            expiresAt: null,
          },
        },
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

describe('WorkQrScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    signInToCenter();
  });

  it('shows the work QR signed by the server and explains in and out', async () => {
    mockApi({
      [`POST ${CODE_PATH}`]: {
        qrContent: QR_CONTENT,
        expiresAt: new Date(Date.now() + 300_000).toISOString(),
      },
    });
    renderScreen(<WorkQrScreen />);

    expect(await screen.findByRole('img', { name: 'Código QR de asistencia' })).toBeOnTheScreen();
    expect(screen.getByText(/El primer escaneo marca tu entrada/)).toBeOnTheScreen();
  });
});

describe('ScanAttendanceScreen with a team member QR', () => {
  beforeEach(() => {
    resetMockRouter();
    signInToCenter();
    latestCameraProps = {};
    jest
      .mocked(useCameraPermissions)
      .mockReturnValue([{ granted: true, canAskAgain: true } as never, jest.fn(), jest.fn()]);
  });

  const STAFF_ENTRY = {
    id: 'entry-1',
    staffMembershipId: 'staff-1',
    workDate: '2026-10-14',
    clockInAt: '2026-10-14T07:02:00.000Z',
    clockOutAt: null,
    isOpen: true,
    workedMinutes: 0,
    inSource: 'qr',
    outSource: null,
    isEdited: false,
    originalClockInAt: null,
    originalClockOutAt: null,
    editedAt: null,
  };

  it('says the clock-in with the time', async () => {
    mockApi({
      [`POST ${CHECK_IN_PATH}`]: {
        kind: 'staff',
        person: {
          membershipId: 'staff-1',
          fullName: 'Ana Pérez',
          photoUrl: null,
          role: 'staff',
        },
        access: { isGranted: true, reason: 'team_member', pass: null },
        staff: {
          membershipId: 'staff-1',
          fullName: 'Ana Pérez',
          action: 'clock_in',
          occurredAt: '2026-10-14T07:02:00.000Z',
          workedMinutes: null,
          entry: STAFF_ENTRY,
        },
      },
    });
    renderScreen(<ScanAttendanceScreen />);

    scanQr(QR_CONTENT);

    expect(await screen.findByText('Ana Pérez')).toBeOnTheScreen();
    expect(screen.getByText('Entrada registrada')).toBeOnTheScreen();
    expect(screen.getByText('Entrada a las 09:02')).toBeOnTheScreen();
  });

  it('says the clock-out with the time and how long they worked', async () => {
    mockApi({
      [`POST ${CHECK_IN_PATH}`]: {
        kind: 'staff',
        person: {
          membershipId: 'staff-1',
          fullName: 'Ana Pérez',
          photoUrl: null,
          role: 'staff',
        },
        access: { isGranted: true, reason: 'team_member', pass: null },
        staff: {
          membershipId: 'staff-1',
          fullName: 'Ana Pérez',
          action: 'clock_out',
          occurredAt: '2026-10-14T12:05:00.000Z',
          workedMinutes: 303,
          entry: { ...STAFF_ENTRY, clockOutAt: '2026-10-14T12:05:00.000Z', isOpen: false },
        },
      },
    });
    renderScreen(<ScanAttendanceScreen />);

    scanQr(QR_CONTENT);

    expect(await screen.findByText('Salida registrada')).toBeOnTheScreen();
    expect(screen.getByText('Salida a las 14:05 · 5 h 3 min trabajadas')).toBeOnTheScreen();
  });
});

describe('ScanAttendanceScreen access verdict', () => {
  beforeEach(() => {
    resetMockRouter();
    signInToCenter();
    latestCameraProps = {};
    jest
      .mocked(useCameraPermissions)
      .mockReturnValue([{ granted: true, canAskAgain: true } as never, jest.fn(), jest.fn()]);
  });

  const CLIENT_PERSON = {
    membershipId: 'client-1',
    fullName: 'Lucía Torres',
    photoUrl: null,
    role: 'client',
  };

  it('shows who it is and that they can come in when the pass is valid', async () => {
    mockApi({
      [`POST ${CHECK_IN_PATH}`]: {
        kind: 'client',
        person: CLIENT_PERSON,
        access: {
          isGranted: true,
          reason: 'valid_pass',
          pass: {
            name: 'Bono 10 clases',
            remainingSessions: 6,
            totalSessions: 10,
            expiresAt: null,
          },
        },
        isFirstCheckIn: false,
      },
    });
    renderScreen(<ScanAttendanceScreen />);

    scanQr(QR_CONTENT);

    expect(await screen.findByText('Puede entrar')).toBeOnTheScreen();
    expect(screen.getByText('Lucía Torres')).toBeOnTheScreen();
    expect(screen.getByText('Bono vigente: Bono 10 clases · quedan 6 de 10')).toBeOnTheScreen();
    expect(
      screen.getByText('No tiene cita ahora, así que no se registra asistencia.'),
    ).toBeOnTheScreen();
  });

  it('says in words that the person cannot come in when there is no valid pass', async () => {
    mockApi({
      [`POST ${CHECK_IN_PATH}`]: {
        kind: 'client',
        person: CLIENT_PERSON,
        access: { isGranted: false, reason: 'pass_exhausted', pass: null },
      },
    });
    renderScreen(<ScanAttendanceScreen />);

    scanQr(QR_CONTENT);

    expect(await screen.findByText('No puede entrar')).toBeOnTheScreen();
    expect(screen.getByText('Se le han agotado las clases del bono')).toBeOnTheScreen();
    expect(screen.queryByText('Asistencia registrada')).not.toBeOnTheScreen();
  });

  it('names the role of a teacher in the modal', async () => {
    mockApi({
      [`POST ${CHECK_IN_PATH}`]: {
        kind: 'staff',
        person: { membershipId: 'staff-1', fullName: 'Ana Pérez', photoUrl: null, role: 'staff' },
        access: { isGranted: true, reason: 'team_member', pass: null },
        staff: {
          membershipId: 'staff-1',
          fullName: 'Ana Pérez',
          action: 'clock_in',
          occurredAt: '2026-10-14T07:02:00.000Z',
          workedMinutes: null,
          entry: {},
        },
      },
    });
    renderScreen(<ScanAttendanceScreen />);

    scanQr(QR_CONTENT);

    expect(await screen.findByText('Puede entrar')).toBeOnTheScreen();
    expect(screen.getByText('Ana Pérez')).toBeOnTheScreen();
    expect(screen.getByText('Equipo del centro')).toBeOnTheScreen();
  });
});
