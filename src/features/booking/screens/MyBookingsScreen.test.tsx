import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';
import { Linking } from 'react-native';

import { useSessionStore } from '@/shared/auth/session-store';
import { buildBooking, BOOKING_ID } from '@/test/booking-factories';
import { NORTE_CENTER_ID } from '@/test/factories';
import { buildApiError, findApiCall, mockApi } from '@/test/mock-api';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { freezeClockAt, restoreClock } from '@/test/freeze-clock';
import { renderScreen } from '@/test/render-screen';

import { BookedScreen } from './BookedScreen';
import { MyBookingsScreen } from './MyBookingsScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const LIST_PATH = `GET /v1/centers/${NORTE_CENTER_ID}/bookings/mine`;
const CANCEL_PATH = `POST /v1/centers/${NORTE_CENTER_ID}/bookings/${BOOKING_ID}/cancel`;

describe('MyBookingsScreen', () => {
  beforeEach(() => {
    // Las citas de prueba son del 8 de octubre de 2026: «ahora» es esa mañana, antes de todas.
    freezeClockAt('2026-10-08T05:00:00.000Z');
    resetMockRouter();
    act(() => {
      useSessionStore.getState().startSession({ accessToken: 'token', user: null });
      useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
    });
  });

  afterEach(() => {
    restoreClock();
  });

  it('lists the upcoming appointments with their status as a word', async () => {
    mockApi({ [LIST_PATH]: { bookings: [buildBooking()] } });
    renderScreen(<MyBookingsScreen />);

    expect(await screen.findByText('Entrenamiento personal')).toBeOnTheScreen();
    expect(screen.getByLabelText('jue 8 oct')).toBeOnTheScreen();
    expect(screen.getByText('18:00 · 60 min · Álex Moreno')).toBeOnTheScreen();
    expect(screen.getByText('Confirmada')).toBeOnTheScreen();
  });

  it('shows where a class held outside the center is and opens the route in the maps', async () => {
    const openUrl = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    mockApi({
      [LIST_PATH]: {
        bookings: [
          buildBooking({
            location: {
              name: 'Parque del Retiro',
              address: 'Plaza de la Independencia 7, Madrid',
              latitude: 40.4153,
              longitude: -3.6844,
            },
          }),
        ],
      },
    });
    renderScreen(<MyBookingsScreen />);

    expect(
      await screen.findByText('Lugar: Parque del Retiro · Plaza de la Independencia 7, Madrid'),
    ).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Cómo llegar' }));

    expect(openUrl).toHaveBeenCalledWith(expect.stringContaining('40.4153'));
    openUrl.mockRestore();
  });

  it('offers no route when the class is in a room of the center', async () => {
    mockApi({ [LIST_PATH]: { bookings: [buildBooking()] } });
    renderScreen(<MyBookingsScreen />);

    expect(await screen.findByText('Entrenamiento personal')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Cómo llegar' })).not.toBeOnTheScreen();
  });

  it('offers to book when there are no upcoming appointments', async () => {
    mockApi({ [LIST_PATH]: { bookings: [] } });
    renderScreen(<MyBookingsScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Agendar cita' }));

    expect(screen.getByText('No tienes citas próximas')).toBeOnTheScreen();
    expect(getMockRouter().push).toHaveBeenCalledWith('/(client)/(tabs)/book');
  });

  it('asks for confirmation, cancels on the server and says it went fine', async () => {
    mockApi({
      [LIST_PATH]: { bookings: [buildBooking()] },
      [CANCEL_PATH]: {
        booking: buildBooking({ status: 'cancelled', cancelWithinPolicy: true }),
        withinPolicy: true,
      },
    });
    renderScreen(<MyBookingsScreen />);

    fireEvent.press(
      await screen.findByRole('button', { name: 'Cancelar cita de Entrenamiento personal' }),
    );
    expect(await screen.findByText('¿Cancelar esta cita?')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Sí, cancelar' }));

    expect(await screen.findByText('Cita cancelada.')).toBeOnTheScreen();
    expect(
      findApiCall('POST', `/v1/centers/${NORTE_CENTER_ID}/bookings/${BOOKING_ID}/cancel`),
    ).toBeDefined();
  });

  it('warns when the cancellation was outside the center policy', async () => {
    mockApi({
      [LIST_PATH]: { bookings: [buildBooking()] },
      [CANCEL_PATH]: {
        booking: buildBooking({ status: 'cancelled', cancelWithinPolicy: false }),
        withinPolicy: false,
      },
    });
    renderScreen(<MyBookingsScreen />);

    fireEvent.press(
      await screen.findByRole('button', { name: 'Cancelar cita de Entrenamiento personal' }),
    );
    fireEvent.press(await screen.findByRole('button', { name: 'Sí, cancelar' }));

    expect(await screen.findByText('Cita cancelada fuera de plazo.')).toBeOnTheScreen();
  });

  it('keeps the appointment when the person changes their mind', async () => {
    mockApi({ [LIST_PATH]: { bookings: [buildBooking()] } });
    renderScreen(<MyBookingsScreen />);

    fireEvent.press(
      await screen.findByRole('button', { name: 'Cancelar cita de Entrenamiento personal' }),
    );
    fireEvent.press(await screen.findByRole('button', { name: 'Mantener cita' }));

    await waitFor(() => {
      expect(screen.queryByText('¿Cancelar esta cita?')).not.toBeOnTheScreen();
    });
    expect(findApiCall('POST', `/v1/centers/${NORTE_CENTER_ID}/bookings/`)).toBeUndefined();
  });

  it('shows past appointments without a cancel button', async () => {
    mockApi({
      [LIST_PATH]: { bookings: [buildBooking({ status: 'cancelled', cancelWithinPolicy: true })] },
    });
    renderScreen(<MyBookingsScreen />);

    fireEvent.press(await screen.findByRole('tab', { name: 'Historial' }));

    expect(await screen.findByText('Cancelada')).toBeOnTheScreen();
    expect(
      screen.queryByRole('button', { name: 'Cancelar cita de Entrenamiento personal' }),
    ).not.toBeOnTheScreen();
  });

  it('explains what the empty history will show and offers to book the first appointment', async () => {
    mockApi({ [LIST_PATH]: { bookings: [] } });
    renderScreen(<MyBookingsScreen />);

    fireEvent.press(await screen.findByRole('tab', { name: 'Historial' }));

    expect(await screen.findByText('Aún no tienes historial')).toBeOnTheScreen();
    expect(screen.getByText('Realizada')).toBeOnTheScreen();
    expect(screen.getByText('Cancelada')).toBeOnTheScreen();
    expect(screen.getByText('No asististe')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Agendar cita' }));
    expect(getMockRouter().push).toHaveBeenCalledWith('/(client)/(tabs)/book');
  });

  it('shows an error with retry when the appointments cannot be loaded', async () => {
    mockApi({
      [LIST_PATH]: () => {
        throw buildApiError('INTERNAL_ERROR', 500);
      },
    });
    renderScreen(<MyBookingsScreen />);

    expect(await screen.findByText('No hemos podido cargar tus citas')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeOnTheScreen();
  });
});

describe('BookedScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    act(() => {
      useSessionStore.getState().startSession({ accessToken: 'token', user: null });
      useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
    });
  });

  it('confirms the appointment with its service and time', async () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ bookingId: BOOKING_ID });
    mockApi({ [LIST_PATH]: { bookings: [buildBooking()] } });
    renderScreen(<BookedScreen />);

    expect(await screen.findByText('Entrenamiento personal · jue 8 oct · 18:00')).toBeOnTheScreen();
    expect(screen.getByRole('heading', { name: 'Cita confirmada' })).toBeOnTheScreen();
  });

  it('opens my appointments from the confirmation', () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ bookingId: BOOKING_ID });
    mockApi({ [LIST_PATH]: { bookings: [buildBooking()] } });
    renderScreen(<BookedScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Ver mis citas' }));

    expect(getMockRouter().replace).toHaveBeenCalledWith('/(client)/(tabs)/bookings');
  });

  it('goes home when the route has no valid appointment', () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ bookingId: 'x' });
    mockApi({});
    renderScreen(<BookedScreen />);

    expect(screen.getByText('redirect:/(client)/(tabs)/home')).toBeOnTheScreen();
  });
});

describe('MyBookingsScreen · past appointments', () => {
  beforeEach(() => {
    resetMockRouter();
    freezeClockAt('2026-10-08T18:00:00.000Z');
    act(() => {
      useSessionStore.getState().startSession({ accessToken: 'token', user: null });
      useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
    });
  });

  afterEach(() => {
    restoreClock();
  });

  it('shows a confirmed appointment whose time has gone as already past, without actions', async () => {
    mockApi({ [LIST_PATH]: { bookings: [buildBooking()] } });
    renderScreen(<MyBookingsScreen />);

    expect(await screen.findByText('Ya pasada')).toBeOnTheScreen();
    expect(screen.queryByText('Confirmada')).not.toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: /Cancelar/ })).not.toBeOnTheScreen();
  });
});
