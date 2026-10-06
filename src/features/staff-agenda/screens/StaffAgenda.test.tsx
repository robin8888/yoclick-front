import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';

import { useSessionStore } from '@/shared/auth/session-store';
import { buildAgenda, buildAgendaEntry, buildSessionRecords } from '@/test/agenda-factories';
import { BOOKING_ID, buildBooking } from '@/test/booking-factories';
import { NORTE_CENTER_ID } from '@/test/factories';
import { buildApiError, findApiCall, mockApi } from '@/test/mock-api';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { AgendaScreen } from './AgendaScreen';
import { InstructorAgendaScreen } from './InstructorAgendaScreen';
import { ClassSessionScreen } from './ClassSessionScreen';
import { SessionRecordsScreen } from './SessionRecordsScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const AGENDA_PATH = `GET /v1/centers/${NORTE_CENTER_ID}/agenda`;
const RECORDS_PATH = `GET /v1/centers/${NORTE_CENTER_ID}/session-records`;
const START_PATH = `POST /v1/centers/${NORTE_CENTER_ID}/bookings/${BOOKING_ID}/start`;
const END_PATH = `POST /v1/centers/${NORTE_CENTER_ID}/bookings/${BOOKING_ID}/end`;

function signInToCenter(): void {
  act(() => {
    useSessionStore.getState().startSession({ accessToken: 'token', user: null });
    useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
  });
}

describe('AgendaScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    signInToCenter();
  });

  it('lists the day appointments with time, service, client and phase as a word', async () => {
    mockApi({ [AGENDA_PATH]: buildAgenda([buildAgendaEntry(60)]) });
    renderScreen(<AgendaScreen isCenterWide={false} />);

    expect(await screen.findByText('Entrenamiento personal')).toBeOnTheScreen();
    expect(screen.getByText('Con Lucía Torres')).toBeOnTheScreen();
    expect(screen.getByText('Pendiente')).toBeOnTheScreen();
    expect(screen.getByRole('heading', { name: 'Mi agenda' })).toBeOnTheScreen();
  });

  it('shows the in-progress phase for a class that was started', async () => {
    mockApi({
      [AGENDA_PATH]: buildAgenda([
        buildAgendaEntry(-10, { startedAt: new Date(Date.now() - 600_000).toISOString() }),
      ]),
    });
    renderScreen(<AgendaScreen isCenterWide={false} />);

    expect(await screen.findByText('En curso')).toBeOnTheScreen();
  });

  it('names the professional only in the center-wide agenda', async () => {
    mockApi({ [AGENDA_PATH]: buildAgenda([buildAgendaEntry(60)]) });
    renderScreen(<AgendaScreen isCenterWide />);

    expect(await screen.findByText('Profesional: Álex Moreno')).toBeOnTheScreen();
    expect(screen.getByRole('heading', { name: 'Agenda del centro' })).toBeOnTheScreen();
  });

  it('opens the class when an appointment is tapped', async () => {
    mockApi({ [AGENDA_PATH]: buildAgenda([buildAgendaEntry(60)]) });
    renderScreen(<AgendaScreen isCenterWide={false} />);

    fireEvent.press(await screen.findByRole('button', { name: /Entrenamiento personal/ }));

    expect(getMockRouter().push).toHaveBeenCalledWith({
      pathname: '/(staff)/sessions/[bookingId]',
      params: { bookingId: BOOKING_ID, date: '2026-10-08' },
    });
  });

  it('explains an empty day', async () => {
    mockApi({ [AGENDA_PATH]: buildAgenda([]) });
    renderScreen(<AgendaScreen isCenterWide={false} />);

    expect(await screen.findByText('Sin citas este día')).toBeOnTheScreen();
  });

  it('shows an error with retry when the agenda cannot be loaded', async () => {
    mockApi({
      [AGENDA_PATH]: () => {
        throw buildApiError('INTERNAL_ERROR', 500);
      },
    });
    renderScreen(<AgendaScreen isCenterWide={false} />);

    expect(await screen.findByText('No hemos podido cargar la agenda')).toBeOnTheScreen();
  });
});

describe('InstructorAgendaScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    signInToCenter();
  });

  it('shows the availability, the day totals and the appointment block', async () => {
    mockApi({
      [AGENDA_PATH]: buildAgenda([buildAgendaEntry(60)]),
      [`GET /v1/centers/${NORTE_CENTER_ID}/notifications`]: { unreadCount: 0, notifications: [] },
    });
    renderScreen(<InstructorAgendaScreen />);

    expect(await screen.findByText('Disponible 08:00–20:00')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: /Entrenamiento personal/ })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Nueva cita' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Escanear QR de asistencia' })).toBeOnTheScreen();
  });

  it('opens the new appointment screen from the floating button', async () => {
    mockApi({
      [AGENDA_PATH]: buildAgenda([]),
      [`GET /v1/centers/${NORTE_CENTER_ID}/notifications`]: { unreadCount: 0, notifications: [] },
    });
    renderScreen(<InstructorAgendaScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Nueva cita' }));

    expect(getMockRouter().push).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: '/(staff)/new-appointment' }),
    );
  });
});

describe('ClassSessionScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    signInToCenter();
    jest
      .mocked(useLocalSearchParams)
      .mockReturnValue({ bookingId: BOOKING_ID, date: '2026-10-08' });
  });

  it('starts a class inside the start window', async () => {
    mockApi({
      [AGENDA_PATH]: buildAgenda([buildAgendaEntry(-5)]),
      [START_PATH]: buildBooking({ startedAt: new Date().toISOString() }),
    });
    renderScreen(<ClassSessionScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Iniciar clase' }));

    expect(await screen.findByRole('button', { name: 'Iniciar clase' })).toBeOnTheScreen();
    expect(
      findApiCall('POST', `/v1/centers/${NORTE_CENTER_ID}/bookings/${BOOKING_ID}/start`),
    ).toBeDefined();
  });

  it('does not let the class start too early and says when it will be possible', async () => {
    mockApi({ [AGENDA_PATH]: buildAgenda([buildAgendaEntry(120)]) });
    renderScreen(<ClassSessionScreen />);

    expect(await screen.findByRole('button', { name: 'Iniciar clase' })).toBeDisabled();
    expect(screen.getByText('Podrás iniciarla 15 minutos antes de la hora.')).toBeOnTheScreen();
  });

  it('says an unregistered past class needs a review by administration', async () => {
    mockApi({ [AGENDA_PATH]: buildAgenda([buildAgendaEntry(-180)]) });
    renderScreen(<ClassSessionScreen />);

    expect(await screen.findByRole('button', { name: 'Iniciar clase' })).toBeDisabled();
    expect(screen.getByText(/ya terminó y no se registró/)).toBeOnTheScreen();
  });

  it('shows the timer while the class is in progress and counts down from the server start', async () => {
    mockApi({
      [AGENDA_PATH]: buildAgenda([
        buildAgendaEntry(-10, { startedAt: new Date(Date.now() - 600_000).toISOString() }),
      ]),
    });
    renderScreen(<ClassSessionScreen />);

    expect(await screen.findByRole('timer', { name: /Restante [45]\d:\d\d/ })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Terminar clase' })).toBeOnTheScreen();
  });

  it('shows extra time when the class runs over', async () => {
    mockApi({
      [AGENDA_PATH]: buildAgenda([
        buildAgendaEntry(-70, { startedAt: new Date(Date.now() - 4_200_000).toISOString() }),
      ]),
    });
    renderScreen(<ClassSessionScreen />);

    expect(await screen.findByRole('timer', { name: /Tiempo extra/ })).toBeOnTheScreen();
  });

  it('asks before ending the class and then ends it on the server', async () => {
    mockApi({
      [AGENDA_PATH]: buildAgenda([
        buildAgendaEntry(-10, { startedAt: new Date(Date.now() - 600_000).toISOString() }),
      ]),
      [END_PATH]: buildBooking({ status: 'attended' }),
    });
    renderScreen(<ClassSessionScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Terminar clase' }));
    expect(await screen.findByText('¿Terminar la clase?')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Sí, terminar' }));

    await waitFor(() => {
      expect(
        findApiCall('POST', `/v1/centers/${NORTE_CENTER_ID}/bookings/${BOOKING_ID}/end`),
      ).toBeDefined();
    });
  });

  it('shows previous versus real duration once the class is finished', async () => {
    mockApi({
      [AGENDA_PATH]: buildAgenda([
        buildAgendaEntry(-70, {
          status: 'attended',
          startedAt: new Date(Date.now() - 4_200_000).toISOString(),
          endedAt: new Date(Date.now() - 600_000).toISOString(),
          actualDurationSeconds: 3600,
        }),
      ]),
    });
    renderScreen(<ClassSessionScreen />);

    expect(
      await screen.findByText('Clase registrada: 1:00:00 de 1:00:00 previstos.'),
    ).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Terminar clase' })).not.toBeOnTheScreen();
  });

  it('says a cancelled appointment cannot be started', async () => {
    mockApi({ [AGENDA_PATH]: buildAgenda([buildAgendaEntry(-5, { status: 'cancelled' })]) });
    renderScreen(<ClassSessionScreen />);

    expect(await screen.findByText('Esta cita está cancelada.')).toBeOnTheScreen();
  });

  it('offers a way back when the appointment is not in the agenda', async () => {
    mockApi({ [AGENDA_PATH]: buildAgenda([]) });
    renderScreen(<ClassSessionScreen />);

    expect(await screen.findByText('No encontramos esta cita')).toBeOnTheScreen();
  });

  it('goes to the root when the route has no valid appointment', () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ bookingId: 'x', date: 'hoy' });
    mockApi({});
    renderScreen(<ClassSessionScreen />);

    expect(screen.getByText('redirect:/')).toBeOnTheScreen();
  });
});

describe('SessionRecordsScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    signInToCenter();
  });

  it('shows the totals per professional and each registered class', async () => {
    mockApi({ [RECORDS_PATH]: buildSessionRecords() });
    renderScreen(<SessionRecordsScreen />);

    expect(await screen.findByText('1 clases')).toBeOnTheScreen();
    expect(screen.getByText('1:04:00 de 1:00:00 previstos')).toBeOnTheScreen();
    expect(screen.getByText('2 sin cerrar')).toBeOnTheScreen();
    expect(screen.getByText('Real 1:04:00 · previsto 1:00:00')).toBeOnTheScreen();
    expect(screen.getByText('Registrada')).toBeOnTheScreen();
  });

  it('explains there are no registered classes', async () => {
    mockApi({ [RECORDS_PATH]: { timezone: 'Europe/Madrid', records: [], totals: [] } });
    renderScreen(<SessionRecordsScreen />);

    expect(await screen.findByText('Sin clases registradas')).toBeOnTheScreen();
  });

  it('shows an error with retry when the records cannot be loaded', async () => {
    mockApi({
      [RECORDS_PATH]: () => {
        throw buildApiError('MFA_REQUIRED', 403);
      },
    });
    renderScreen(<SessionRecordsScreen />);

    expect(await screen.findByText('No hemos podido cargar el registro')).toBeOnTheScreen();
  });
});
