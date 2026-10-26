import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';

import { useSessionStore } from '@/shared/auth/session-store';
import {
  BOOKING_ID,
  buildAvailability,
  buildBooking,
  buildService,
  SERVICE_ID,
  STAFF_MEMBERSHIP_ID,
} from '@/test/booking-factories';
import { NORTE_CENTER_ID } from '@/test/factories';
import { freezeClockAt, restoreClock } from '@/test/freeze-clock';
import { buildApiError, findApiCall, getRecordedApiCalls, mockApi } from '@/test/mock-api';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { BookHourConfirmScreen } from './BookHourConfirmScreen';
import { BookHourScreen } from './BookHourScreen';
import { BookServiceScreen } from './BookServiceScreen';
import { RescheduleBookingScreen } from './RescheduleBookingScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));
// El módulo nativo de expo-crypto no existe en Jest.
jest.mock('expo-crypto', () => ({ randomUUID: () => '3f2b8c1e-5d4a-4e7b-9c10-a1b2c3d4e5f6' }));

const SERVICES_PATH = `GET /v1/centers/${NORTE_CENTER_ID}/services`;
const AVAILABILITY_PATH = `GET /v1/centers/${NORTE_CENTER_ID}/availability`;
const CREATE_BOOKING_PATH = `POST /v1/centers/${NORTE_CENTER_ID}/bookings`;
const LUCIA_ID = '0191d6a0-0000-7000-8000-0000000000b2';
const OPEN_SESSIONS_PATH = `GET /v1/centers/${NORTE_CENTER_ID}/services/${SERVICE_ID}/open-sessions`;
const RESCHEDULE_PATH = `POST /v1/centers/${NORTE_CENTER_ID}/bookings/${BOOKING_ID}/reschedule`;
const FIRST_SLOT_STARTS_AT = '2026-10-08T07:00:00.000Z';

function setRouteParams(params: Record<string, string>): void {
  jest.mocked(useLocalSearchParams).mockReturnValue(params);
}

/** Un servicio de citas: individual y sin sala ni horario de clase. */
function buildAppointmentService(
  overrides: Parameters<typeof buildService>[0] = {},
): ReturnType<typeof buildService> {
  return buildService({ hasSchedule: false, mode: 'private', name: 'Corte de pelo', ...overrides });
}

describe('booking by free hour', () => {
  beforeEach(() => {
    resetMockRouter();
    act(() => {
      useSessionStore.getState().startSession({ accessToken: 'token', user: null });
      useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
    });
    // Las horas de prueba son del 8 de octubre de 2026: «ahora» es antes, para que sigan libres.
    freezeClockAt('2026-10-07T08:00:00.000Z');
  });

  afterEach(() => {
    restoreClock();
  });

  describe('BookServiceScreen', () => {
    it('lets the client pick an individual service without schedule and continues to day and hour', async () => {
      mockApi({ [SERVICES_PATH]: { services: [buildAppointmentService()] } });
      renderScreen(<BookServiceScreen />);

      expect(await screen.findByRole('radio', { name: /Corte de pelo/ })).toBeChecked();
      fireEvent.press(screen.getByRole('button', { name: 'Continuar' }));

      expect(getMockRouter().push).toHaveBeenCalledWith({
        pathname: '/(client)/book/hour',
        params: { serviceId: SERVICE_ID },
      });
    });

    it('keeps a group service without schedule closed until the center sets its classes', async () => {
      mockApi({ [SERVICES_PATH]: { services: [buildAppointmentService({ mode: 'group' })] } });
      renderScreen(<BookServiceScreen />);

      expect(await screen.findByRole('radio', { name: /Corte de pelo/ })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled();
    });
  });

  describe('BookHourScreen', () => {
    beforeEach(() => {
      setRouteParams({ serviceId: SERVICE_ID });
    });

    it('offers the free hours of the first day with hours and goes on with the chosen one', async () => {
      mockApi({
        [SERVICES_PATH]: { services: [buildAppointmentService()] },
        [AVAILABILITY_PATH]: buildAvailability(),
      });
      renderScreen(<BookHourScreen />);

      fireEvent.press(await screen.findByRole('button', { name: '09:00' }));
      expect(screen.getByRole('button', { name: 'Revisar reserva' })).toBeEnabled();
      fireEvent.press(screen.getByRole('button', { name: 'Revisar reserva' }));

      expect(getMockRouter().push).toHaveBeenCalledWith({
        pathname: '/(client)/book/hour-confirm',
        params: {
          serviceId: SERVICE_ID,
          startsAt: FIRST_SLOT_STARTS_AT,
          staffMembershipId: STAFF_MEMBERSHIP_ID,
          staffName: 'Álex Moreno',
        },
      });
    });

    it('does not let the client continue until an hour is chosen', async () => {
      mockApi({
        [SERVICES_PATH]: { services: [buildAppointmentService()] },
        [AVAILABILITY_PATH]: buildAvailability(),
      });
      renderScreen(<BookHourScreen />);

      expect(await screen.findByRole('button', { name: '09:00' })).toBeOnTheScreen();
      expect(screen.getByRole('button', { name: 'Revisar reserva' })).toBeDisabled();
    });

    it('lets the client choose who gives the appointment when there is more than one person', async () => {
      const staff = [
        { membershipId: STAFF_MEMBERSHIP_ID, fullName: 'Álex Moreno', photoUrl: null, photos: [] },
        { membershipId: LUCIA_ID, fullName: 'Lucía Ferrer', photoUrl: null, photos: [] },
      ];
      mockApi({
        [SERVICES_PATH]: { services: [buildAppointmentService({ staff })] },
        [AVAILABILITY_PATH]: buildAvailability(),
      });
      renderScreen(<BookHourScreen />);

      expect(await screen.findByRole('radio', { name: 'Cualquiera disponible' })).toBeChecked();
      fireEvent.press(screen.getByRole('radio', { name: 'Lucía Ferrer' }));

      await waitFor(() => {
        expect(
          getRecordedApiCalls().some((call) => call.path.includes(`staffMembershipId=${LUCIA_ID}`)),
        ).toBe(true);
      });
    });

    it('does not offer to choose when only one person gives the service', async () => {
      mockApi({
        [SERVICES_PATH]: { services: [buildAppointmentService()] },
        [AVAILABILITY_PATH]: buildAvailability(),
      });
      renderScreen(<BookHourScreen />);

      expect(await screen.findByRole('button', { name: '09:00' })).toBeOnTheScreen();
      expect(screen.queryByRole('radio', { name: 'Cualquiera disponible' })).toBeNull();
    });

    it('says there are no free hours when the server has none', async () => {
      mockApi({
        [SERVICES_PATH]: { services: [buildAppointmentService()] },
        [AVAILABILITY_PATH]: {
          timezone: 'Europe/Madrid',
          days: [{ date: '2026-10-07', slots: [] }],
        },
      });
      renderScreen(<BookHourScreen />);

      expect(await screen.findByText(/No hay horas libres en los próximos días/)).toBeOnTheScreen();
    });

    it('goes back to the services when the route parameters are not valid', () => {
      setRouteParams({ serviceId: 'no-es-un-uuid' });
      mockApi({ [SERVICES_PATH]: { services: [] } });
      renderScreen(<BookHourScreen />);

      expect(screen.queryByText('Día y hora')).toBeNull();
    });
  });

  describe('BookHourConfirmScreen', () => {
    beforeEach(() => {
      setRouteParams({
        serviceId: SERVICE_ID,
        startsAt: FIRST_SLOT_STARTS_AT,
        staffMembershipId: STAFF_MEMBERSHIP_ID,
        staffName: 'Álex Moreno',
      });
    });

    it('books the hour with an idempotency key and opens the done screen', async () => {
      mockApi({
        [SERVICES_PATH]: { services: [buildAppointmentService()] },
        [CREATE_BOOKING_PATH]: buildBooking(),
        [`GET /v1/centers/${NORTE_CENTER_ID}/bookings/mine`]: { bookings: [] },
      });
      renderScreen(<BookHourConfirmScreen />);

      expect(await screen.findByText(/Corte de pelo/)).toBeOnTheScreen();
      fireEvent.press(screen.getByRole('button', { name: 'Confirmar reserva' }));

      await waitFor(() => {
        expect(getMockRouter().replace).toHaveBeenCalledWith({
          pathname: '/(client)/book/done',
          params: { bookingId: BOOKING_ID },
        });
      });
      expect(findApiCall('POST', `/v1/centers/${NORTE_CENTER_ID}/bookings`)?.body).toEqual({
        serviceId: SERVICE_ID,
        startsAt: FIRST_SLOT_STARTS_AT,
        staffMembershipId: STAFF_MEMBERSHIP_ID,
      });
    });

    it('asks to get a pass first when the center sells them, and takes the person to the passes', async () => {
      mockApi({
        [SERVICES_PATH]: { services: [buildAppointmentService()] },
        [CREATE_BOOKING_PATH]: () => {
          throw buildApiError('PASS_NEEDED_TO_BOOK', 409);
        },
      });
      renderScreen(<BookHourConfirmScreen />);

      expect(await screen.findByText(/Corte de pelo/)).toBeOnTheScreen();
      fireEvent.press(screen.getByRole('button', { name: 'Confirmar reserva' }));

      expect(await screen.findByText('Primero necesitas un bono')).toBeOnTheScreen();
      expect(screen.queryByText('No se ha podido guardar')).not.toBeOnTheScreen();
      fireEvent.press(screen.getByRole('button', { name: 'Ver bonos' }));
      expect(getMockRouter().push).toHaveBeenCalledWith('/(client)/my-passes');
    });

    it('explains that the hour was taken meanwhile and stays on the screen', async () => {
      mockApi({
        [SERVICES_PATH]: { services: [buildAppointmentService()] },
        [CREATE_BOOKING_PATH]: () => {
          throw buildApiError('SLOT_UNAVAILABLE', 409);
        },
      });
      renderScreen(<BookHourConfirmScreen />);

      fireEvent.press(await screen.findByRole('button', { name: 'Confirmar reserva' }));

      expect(await screen.findByRole('alert')).toBeOnTheScreen();
      expect(getMockRouter().replace).not.toHaveBeenCalled();
    });
  });
  describe('RescheduleBookingScreen for an individual appointment', () => {
    beforeEach(() => {
      setRouteParams({
        bookingId: BOOKING_ID,
        serviceId: SERVICE_ID,
        staffMembershipId: STAFF_MEMBERSHIP_ID,
        serviceName: 'Corte de pelo',
        startsAt: '2026-10-09T08:00:00.000Z',
      });
    });

    it('moves the appointment to another free hour of the same person', async () => {
      mockApi({
        [SERVICES_PATH]: { services: [buildAppointmentService()] },
        [OPEN_SESSIONS_PATH]: {
          timezone: 'Europe/Madrid',
          isScheduled: false,
          sessions: [],
          nextOpenStartsAt: null,
        },
        [AVAILABILITY_PATH]: buildAvailability(),
        [RESCHEDULE_PATH]: buildBooking(),
        [`GET /v1/centers/${NORTE_CENTER_ID}/bookings/mine`]: { bookings: [] },
      });
      renderScreen(<RescheduleBookingScreen />);

      fireEvent.press(await screen.findByRole('button', { name: '09:00' }));
      fireEvent.press(screen.getByRole('button', { name: 'Confirmar cambio' }));

      await waitFor(() => {
        expect(getMockRouter().dismissTo).toHaveBeenCalledWith('/(client)/(tabs)/bookings');
      });
      expect(
        findApiCall('POST', `/v1/centers/${NORTE_CENTER_ID}/bookings/${BOOKING_ID}/reschedule`)
          ?.body,
      ).toEqual({
        startsAt: FIRST_SLOT_STARTS_AT,
      });
    });
  });
});
