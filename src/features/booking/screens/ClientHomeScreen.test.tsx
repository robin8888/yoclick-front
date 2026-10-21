import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import { useSessionStore } from '@/shared/auth/session-store';
import { buildBooking, SERVICE_ID, STAFF_MEMBERSHIP_ID } from '@/test/booking-factories';
import { buildMembership, NORTE_CENTER_ID } from '@/test/factories';
import { mockApi } from '@/test/mock-api';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { ClientHomeScreen } from './ClientHomeScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const LIST_PATH = `GET /v1/centers/${NORTE_CENTER_ID}/bookings/mine`;
const OPEN_SESSIONS_PATH = `GET /v1/centers/${NORTE_CENTER_ID}/services/${SERVICE_ID}/open-sessions`;
// La cita de ejemplo es un jueves a las 18:00 de Madrid; esta clase es otro jueves a esa hora, lejos.
const SAME_WEEKDAY_AND_TIME = '2099-01-08T17:00:00.000Z';

function buildOpenSessions(startsAt: string): unknown {
  return {
    timezone: 'Europe/Madrid',
    isScheduled: true,
    nextOpenStartsAt: startsAt,
    sessions: [
      {
        id: '0191d6a0-0000-7000-8000-0000000000e1',
        startsAt,
        endsAt: startsAt,
        mode: 'group',
        capacity: 10,
        bookedCount: 3,
        remainingSeats: 7,
        room: null,
        teacher: { membershipId: STAFF_MEMBERSHIP_ID, fullName: 'Álex Moreno' },
        label: null,
      },
    ],
  };
}

describe('ClientHomeScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    act(() => {
      useSessionStore.getState().startSession({
        accessToken: 'token',
        user: { id: 'user-1', email: 'leti@yopmail.com', fullName: 'Leticia Duarte Duate' },
      });
      useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
    });
  });

  // Las consultas del inicio acaban después de la primera aserción: se dejan terminar dentro de act.
  afterEach(async () => {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  });

  it('greets the person by first name', async () => {
    mockApi({
      [LIST_PATH]: { bookings: [] },
      'GET /v1/me/memberships': { memberships: [buildMembership()] },
    });
    renderScreen(<ClientHomeScreen />);

    expect(screen.getByRole('heading', { name: 'Hola, Leticia' })).toBeOnTheScreen();
    expect(await screen.findByText('Esta semana')).toBeOnTheScreen();
  });

  it('shows the next appointment with its date, time and duration', async () => {
    mockApi({
      [LIST_PATH]: { bookings: [buildBooking()] },
      [OPEN_SESSIONS_PATH]: buildOpenSessions('2099-01-09T17:00:00.000Z'),
      'GET /v1/me/memberships': { memberships: [buildMembership()] },
    });
    renderScreen(<ClientHomeScreen />);

    expect(await screen.findByText('Entrenamiento personal')).toBeOnTheScreen();
    expect(screen.getByText('jue 8 oct')).toBeOnTheScreen();
    expect(screen.getByText('18:00 · 1 h')).toBeOnTheScreen();
  });

  it('counts the sessions attended this week against the weekly goal', async () => {
    mockApi({
      [LIST_PATH]: { bookings: [] },
      'GET /v1/me/memberships': { memberships: [buildMembership()] },
    });
    renderScreen(<ClientHomeScreen />);

    expect(await screen.findByText('Te queda 4 para tu objetivo.')).toBeOnTheScreen();
  });

  it('says there is no next appointment and offers to book', async () => {
    mockApi({
      [LIST_PATH]: { bookings: [] },
      'GET /v1/me/memberships': { memberships: [buildMembership()] },
    });
    renderScreen(<ClientHomeScreen />);

    expect(await screen.findByText('Aún no tienes ninguna cita próxima.')).toBeOnTheScreen();
    fireEvent.press(screen.getAllByRole('button', { name: 'Reservar cita' })[0] as never);

    expect(getMockRouter().push).toHaveBeenCalledWith('/(client)/(tabs)/book');
  });
  it('offers to repeat the last appointment on the same weekday and time and opens its summary', async () => {
    mockApi({
      [LIST_PATH]: { bookings: [buildBooking()] },
      [OPEN_SESSIONS_PATH]: buildOpenSessions(SAME_WEEKDAY_AND_TIME),
      'GET /v1/me/memberships': { memberships: [buildMembership()] },
    });
    renderScreen(<ClientHomeScreen />);

    expect(await screen.findByText('Repetir tu última cita')).toBeOnTheScreen();
    expect(screen.getByText(/Entrenamiento personal · .* 18:00 con Álex Moreno/)).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: /Repetir tu última cita/ }));

    expect(getMockRouter().push).toHaveBeenCalledWith({
      pathname: '/(client)/book/confirm',
      params: {
        serviceId: SERVICE_ID,
        classSessionId: '0191d6a0-0000-7000-8000-0000000000e1',
        startsAt: SAME_WEEKDAY_AND_TIME,
        staffName: 'Álex Moreno',
      },
    });
  });

  it('does not offer to repeat when no class matches the last appointment', async () => {
    mockApi({
      [LIST_PATH]: { bookings: [buildBooking()] },
      // Viernes: otro día de la semana.
      [OPEN_SESSIONS_PATH]: buildOpenSessions('2099-01-09T17:00:00.000Z'),
      'GET /v1/me/memberships': { memberships: [buildMembership()] },
    });
    renderScreen(<ClientHomeScreen />);

    expect(await screen.findByText('Entrenamiento personal')).toBeOnTheScreen();
    await waitFor(() => {
      expect(screen.queryByText('Repetir tu última cita')).not.toBeOnTheScreen();
    });
  });
});
