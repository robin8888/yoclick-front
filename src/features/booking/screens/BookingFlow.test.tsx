import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';

import { apiMutator } from '@/shared/api/api-mutator';
import { useSessionStore } from '@/shared/auth/session-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import { BOOKING_ID, buildBooking, buildService, SERVICE_ID } from '@/test/booking-factories';
import { buildApiError, findApiCall, mockApi } from '@/test/mock-api';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { freezeClockAt, restoreClock } from '@/test/freeze-clock';
import { renderScreen } from '@/test/render-screen';

import { BookConfirmScreen } from './BookConfirmScreen';
import { RescheduleBookingScreen } from './RescheduleBookingScreen';
import { BookServiceScreen } from './BookServiceScreen';
import { BookSlotScreen } from './BookSlotScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));
// El módulo nativo de expo-crypto no existe en Jest.
jest.mock('expo-crypto', () => ({ randomUUID: () => '3f2b8c1e-5d4a-4e7b-9c10-a1b2c3d4e5f6' }));

const SERVICES_PATH = `GET /v1/centers/${NORTE_CENTER_ID}/services`;
const LIST_BOOKINGS_PATH = `GET /v1/centers/${NORTE_CENTER_ID}/bookings/mine`;
const OPEN_SESSIONS_PATH = `GET /v1/centers/${NORTE_CENTER_ID}/services/${SERVICE_ID}/open-sessions`;
const JOIN_SESSION_PATH = `POST /v1/centers/${NORTE_CENTER_ID}/bookings/join-session`;
const CLASS_SESSION_ID = '0191d6a0-0000-7000-8000-0000000000e1';
const CLASS_STARTS_AT = '2026-10-14T16:30:00.000Z';
const OPEN_SESSIONS = {
  timezone: 'Europe/Madrid',
  isScheduled: true,
  sessions: [
    {
      id: CLASS_SESSION_ID,
      startsAt: CLASS_STARTS_AT,
      endsAt: '2026-10-14T18:30:00.000Z',
      mode: 'group',
      capacity: 10,
      bookedCount: 3,
      remainingSeats: 7,
      room: { id: 'room-1', name: 'Sala 1' },
      teacher: { membershipId: '0191d6a0-0000-7000-8000-0000000000b1', fullName: 'Ana Ruiz' },
      label: null,
    },
  ],
  nextOpenStartsAt: CLASS_STARTS_AT,
};

function setRouteParams(params: Record<string, string>): void {
  jest.mocked(useLocalSearchParams).mockReturnValue(params);
}

describe('booking flow', () => {
  beforeEach(() => {
    resetMockRouter();
    act(() => {
      useSessionStore.getState().startSession({ accessToken: 'token', user: null });
      useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
    });
  });

  describe('BookServiceScreen', () => {
    it('lists the center services with duration and price', async () => {
      mockApi({
        [SERVICES_PATH]: {
          services: [
            buildService(),
            buildService({ id: 'otro', name: 'Valoración', priceCents: null, durationMinutes: 30 }),
          ],
        },
      });
      renderScreen(<BookServiceScreen />);

      expect(
        await screen.findByRole('radio', { name: /Entrenamiento personal/ }),
      ).toBeOnTheScreen();
      expect(screen.getByText('60 min · Individual · 35 €')).toBeOnTheScreen();
      expect(screen.getByText('30 min · Individual · Precio a consultar')).toBeOnTheScreen();
      expect(screen.getByRole('progressbar', { name: 'Paso 1 de 2' })).toBeOnTheScreen();
    });

    it('says free when the service has no price', async () => {
      mockApi({ [SERVICES_PATH]: { services: [buildService({ priceCents: 0 })] } });
      renderScreen(<BookServiceScreen />);

      expect(await screen.findByText('60 min · Individual · Gratis')).toBeOnTheScreen();
    });

    it('goes straight to the day and class step with the chosen service', async () => {
      mockApi({ [SERVICES_PATH]: { services: [buildService()] } });
      renderScreen(<BookServiceScreen />);

      expect(await screen.findByRole('button', { name: 'Continuar' })).toBeDisabled();
      fireEvent.press(await screen.findByRole('radio', { name: /Entrenamiento personal/ }));
      expect(screen.getByRole('radio', { name: /Entrenamiento personal/ })).toBeChecked();
      fireEvent.press(screen.getByRole('button', { name: 'Continuar' }));

      expect(getMockRouter().push).toHaveBeenCalledWith({
        pathname: '/(client)/book/slot',
        params: { serviceId: SERVICE_ID },
      });
    });

    it('explains there are no services yet and offers a retry', async () => {
      mockApi({ [SERVICES_PATH]: { services: [] } });
      renderScreen(<BookServiceScreen />);

      expect(await screen.findByText('Aún no hay servicios')).toBeOnTheScreen();
      expect(screen.getByRole('button', { name: 'Reintentar' })).toBeOnTheScreen();
    });

    it('shows an error with retry when the services cannot be loaded', async () => {
      mockApi({
        [SERVICES_PATH]: () => {
          throw buildApiError('INTERNAL_ERROR', 500);
        },
      });
      renderScreen(<BookServiceScreen />);

      expect(await screen.findByText('No hemos podido cargar los servicios')).toBeOnTheScreen();
    });
  });

  describe('BookSlotScreen', () => {
    beforeEach(() => {
      setRouteParams({ serviceId: SERVICE_ID });
      // Las clases de prueba son del 14 de octubre de 2026: «ahora» es antes, para que sigan libres.
      freezeClockAt('2026-10-13T08:00:00.000Z');
    });

    afterEach(() => {
      restoreClock();
    });

    it('offers the days with a class and the classes of the first one, without choosing a teacher', async () => {
      mockApi({
        [SERVICES_PATH]: { services: [buildService()] },
        [OPEN_SESSIONS_PATH]: OPEN_SESSIONS,
      });
      renderScreen(<BookSlotScreen />);

      expect(await screen.findByText('18:30–20:30')).toBeOnTheScreen();
      expect(screen.getByText('Quedan 7 de 10 plazas · con Ana Ruiz')).toBeOnTheScreen();
      expect(
        screen.getByRole('button', { name: '14 de octubre de 2026', selected: true }),
      ).toBeOnTheScreen();
      expect(screen.getByRole('button', { name: '15 de octubre de 2026' })).toBeDisabled();
      expect(screen.getByRole('button', { name: '12 de octubre de 2026' })).toBeDisabled();
    });

    it('needs a class before continuing and then goes to confirm with it', async () => {
      mockApi({
        [SERVICES_PATH]: { services: [buildService()] },
        [OPEN_SESSIONS_PATH]: OPEN_SESSIONS,
      });
      renderScreen(<BookSlotScreen />);
      await screen.findByText('18:30–20:30');

      expect(screen.getByRole('button', { name: 'Revisar reserva' })).toBeDisabled();
      fireEvent.press(screen.getByText('18:30–20:30'));
      fireEvent.press(screen.getByRole('button', { name: 'Revisar reserva' }));

      expect(getMockRouter().push).toHaveBeenCalledWith({
        pathname: '/(client)/book/confirm',
        params: {
          serviceId: SERVICE_ID,
          classSessionId: CLASS_SESSION_ID,
          startsAt: CLASS_STARTS_AT,
          staffName: 'Ana Ruiz',
        },
      });
    });

    it('does not offer a class that already started', async () => {
      freezeClockAt('2026-10-14T17:00:00.000Z');
      mockApi({
        [SERVICES_PATH]: { services: [buildService()] },
        [OPEN_SESSIONS_PATH]: OPEN_SESSIONS,
      });
      renderScreen(<BookSlotScreen />);

      expect(await screen.findByText(/Ese día no hay clases con plazas/)).toBeOnTheScreen();
      expect(screen.queryByText('18:30–20:30')).not.toBeOnTheScreen();
    });

    it('tells the client there are no schedules yet when the center has not set any', async () => {
      mockApi({
        [SERVICES_PATH]: { services: [buildService()] },
        [OPEN_SESSIONS_PATH]: {
          timezone: 'Europe/Madrid',
          isScheduled: false,
          sessions: [],
          nextOpenStartsAt: null,
        },
      });
      renderScreen(<BookSlotScreen />);

      expect(await screen.findByText('Aún no hay horarios')).toBeOnTheScreen();
      expect(screen.getAllByText(/no tiene sala ni horario establecidos/).length).toBeGreaterThan(
        0,
      );
      fireEvent.press(screen.getByRole('button', { name: 'Entendido' }));
      expect(getMockRouter().back).toHaveBeenCalled();
    });

    it('goes back to the services when the route has no valid service', () => {
      setRouteParams({ serviceId: 'no-es-un-uuid' });
      mockApi({});
      renderScreen(<BookSlotScreen />);

      expect(screen.getByText('redirect:/(client)/(tabs)/book')).toBeOnTheScreen();
    });
  });

  describe('BookConfirmScreen', () => {
    beforeEach(() => {
      setRouteParams({
        serviceId: SERVICE_ID,
        classSessionId: CLASS_SESSION_ID,
        startsAt: CLASS_STARTS_AT,
        staffName: 'Ana Ruiz',
      });
    });

    it('summarizes service, time, professional and price', async () => {
      mockApi({ [SERVICES_PATH]: { services: [buildService()] } });
      renderScreen(<BookConfirmScreen />);

      expect(await screen.findByText('Entrenamiento personal · 1 h')).toBeOnTheScreen();
      expect(screen.getByText('mié 14 oct · 18:30')).toBeOnTheScreen();
      expect(screen.getByText('Ana Ruiz')).toBeOnTheScreen();
      expect(screen.getByText('35 €')).toBeOnTheScreen();
    });

    it('joins the class with an idempotency key and opens the confirmation', async () => {
      mockApi({
        [SERVICES_PATH]: { services: [buildService()] },
        [JOIN_SESSION_PATH]: buildBooking(),
        [LIST_BOOKINGS_PATH]: { bookings: [buildBooking()] },
      });
      renderScreen(<BookConfirmScreen />);

      fireEvent.press(screen.getByRole('button', { name: 'Confirmar reserva' }));

      await waitFor(() => {
        expect(getMockRouter().replace).toHaveBeenCalledWith({
          pathname: '/(client)/book/done',
          params: { bookingId: BOOKING_ID },
        });
      });
      expect(
        findApiCall('POST', `/v1/centers/${NORTE_CENTER_ID}/bookings/join-session`)?.body,
      ).toEqual({ classSessionId: CLASS_SESSION_ID });
      const [, requestInit] = jest
        .mocked(apiMutator)
        .mock.calls.find(([path]) => path.endsWith('/bookings/join-session')) ?? ['', {}];
      expect((requestInit.headers as Record<string, string>)['Idempotency-Key']).toMatch(
        /^[0-9a-f-]{36}$/,
      );
    });

    it('shows why it failed when the class filled up meanwhile and stays on the screen', async () => {
      mockApi({
        [SERVICES_PATH]: { services: [buildService()] },
        [JOIN_SESSION_PATH]: () => {
          throw buildApiError('SESSION_FULL', 409);
        },
      });
      renderScreen(<BookConfirmScreen />);

      fireEvent.press(screen.getByRole('button', { name: 'Confirmar reserva' }));

      expect(await screen.findByRole('alert')).toBeOnTheScreen();
      expect(getMockRouter().replace).not.toHaveBeenCalled();
    });

    it('goes back to the services when the route parameters are not valid', () => {
      setRouteParams({ serviceId: SERVICE_ID, startsAt: 'ayer' });
      mockApi({});
      renderScreen(<BookConfirmScreen />);

      expect(screen.getByText('redirect:/(client)/(tabs)/book')).toBeOnTheScreen();
    });
  });

  describe('RescheduleBookingScreen', () => {
    const OTHER_CLASS_ID = '0191d6a0-0000-7000-8000-0000000000e2';
    const OTHER_CLASS_STARTS_AT = '2026-10-16T08:00:00.000Z';
    const MOVE_PATH = `POST /v1/centers/${NORTE_CENTER_ID}/bookings/${BOOKING_ID}/move-to-session`;
    const TWO_CLASSES = {
      ...OPEN_SESSIONS,
      sessions: [
        ...OPEN_SESSIONS.sessions,
        {
          ...OPEN_SESSIONS.sessions[0],
          id: OTHER_CLASS_ID,
          startsAt: OTHER_CLASS_STARTS_AT,
          endsAt: '2026-10-16T10:00:00.000Z',
          bookedCount: 9,
          remainingSeats: 1,
        },
      ],
    };

    beforeEach(() => {
      setRouteParams({
        bookingId: BOOKING_ID,
        serviceId: SERVICE_ID,
        staffMembershipId: '0191d6a0-0000-7000-8000-0000000000b1',
        serviceName: 'Entrenamiento personal',
        startsAt: CLASS_STARTS_AT,
      });
      freezeClockAt('2026-10-13T08:00:00.000Z');
    });

    afterEach(() => {
      restoreClock();
    });

    it('moves the booking to another class with seats and tells where it was', async () => {
      mockApi({
        [OPEN_SESSIONS_PATH]: TWO_CLASSES,
        [MOVE_PATH]: buildBooking(),
        [LIST_BOOKINGS_PATH]: { bookings: [buildBooking()] },
      });
      renderScreen(<RescheduleBookingScreen />);

      fireEvent.press(await screen.findByRole('button', { name: '16 de octubre de 2026' }));
      fireEvent.press(await screen.findByText('10:00–12:00'));
      fireEvent.press(screen.getByRole('button', { name: 'Confirmar cambio' }));

      await waitFor(() => {
        expect(getMockRouter().dismissTo).toHaveBeenCalledWith('/(client)/(tabs)/bookings');
      });
      expect(
        findApiCall('POST', `/v1/centers/${NORTE_CENTER_ID}/bookings/${BOOKING_ID}/move`)?.body,
      ).toEqual({ classSessionId: OTHER_CLASS_ID });
    });

    it('does not let the person confirm until another class is chosen', async () => {
      mockApi({ [OPEN_SESSIONS_PATH]: TWO_CLASSES });
      renderScreen(<RescheduleBookingScreen />);

      expect(await screen.findByRole('button', { name: 'Confirmar cambio' })).toBeDisabled();
    });

    it('explains why when the class filled up meanwhile', async () => {
      mockApi({
        [OPEN_SESSIONS_PATH]: TWO_CLASSES,
        [MOVE_PATH]: () => {
          throw buildApiError('SESSION_FULL', 409);
        },
      });
      renderScreen(<RescheduleBookingScreen />);

      fireEvent.press(await screen.findByRole('button', { name: '16 de octubre de 2026' }));
      fireEvent.press(await screen.findByText('10:00–12:00'));
      fireEvent.press(screen.getByRole('button', { name: 'Confirmar cambio' }));

      expect(await screen.findByRole('alert')).toBeOnTheScreen();
      expect(getMockRouter().dismissTo).not.toHaveBeenCalled();
    });
  });
});
