import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';

import { apiMutator } from '@/shared/api/api-mutator';
import { useSessionStore } from '@/shared/auth/session-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import {
  BOOKING_ID,
  buildAvailability,
  buildBooking,
  buildService,
  SERVICE_ID,
  STAFF_MEMBERSHIP_ID,
} from '@/test/booking-factories';
import { buildApiError, findApiCall, mockApi } from '@/test/mock-api';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { BookConfirmScreen } from './BookConfirmScreen';
import { BookServiceScreen } from './BookServiceScreen';
import { BookSlotScreen } from './BookSlotScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));
// El módulo nativo de expo-crypto no existe en Jest.
jest.mock('expo-crypto', () => ({ randomUUID: () => '3f2b8c1e-5d4a-4e7b-9c10-a1b2c3d4e5f6' }));

const SERVICES_PATH = `GET /v1/centers/${NORTE_CENTER_ID}/services`;
const AVAILABILITY_PATH = `GET /v1/centers/${NORTE_CENTER_ID}/availability`;
const CREATE_BOOKING_PATH = `POST /v1/centers/${NORTE_CENTER_ID}/bookings`;
const LIST_BOOKINGS_PATH = `GET /v1/centers/${NORTE_CENTER_ID}/bookings/mine`;
const SLOT_STARTS_AT = '2026-10-08T16:00:00.000Z';

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
        await screen.findByRole('button', { name: /Entrenamiento personal/ }),
      ).toBeOnTheScreen();
      expect(screen.getByText('1 h · 35 €')).toBeOnTheScreen();
      expect(screen.getByText('30 min · Precio a consultar')).toBeOnTheScreen();
    });

    it('goes to the day and time step with the chosen service', async () => {
      mockApi({ [SERVICES_PATH]: { services: [buildService()] } });
      renderScreen(<BookServiceScreen />);

      fireEvent.press(await screen.findByRole('button', { name: /Entrenamiento personal/ }));

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
    });

    it('opens on the first day with free hours and lists them in the center time zone', async () => {
      mockApi({
        [SERVICES_PATH]: { services: [buildService()] },
        [AVAILABILITY_PATH]: buildAvailability(),
      });
      renderScreen(<BookSlotScreen />);

      expect(await screen.findByRole('button', { name: '09:00' })).toBeOnTheScreen();
      expect(screen.getByRole('button', { name: '18:00' })).toBeOnTheScreen();
      expect(
        screen.getByRole('button', { name: 'jueves 8 de octubre', selected: true }),
      ).toBeOnTheScreen();
      expect(screen.getByRole('button', { name: 'miércoles 7 de octubre' })).toBeDisabled();
    });

    it('needs a time before continuing and then confirms with the chosen slot', async () => {
      mockApi({
        [SERVICES_PATH]: { services: [buildService()] },
        [AVAILABILITY_PATH]: buildAvailability(),
      });
      renderScreen(<BookSlotScreen />);
      await screen.findByRole('button', { name: '18:00' });

      expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled();
      fireEvent.press(screen.getByRole('button', { name: '18:00' }));
      fireEvent.press(screen.getByRole('button', { name: 'Continuar' }));

      expect(getMockRouter().push).toHaveBeenCalledWith({
        pathname: '/(client)/book/confirm',
        params: {
          serviceId: SERVICE_ID,
          startsAt: SLOT_STARTS_AT,
          staffMembershipId: STAFF_MEMBERSHIP_ID,
          staffName: 'Álex Moreno',
        },
      });
    });

    it('says there are no free hours when every day is empty', async () => {
      mockApi({
        [SERVICES_PATH]: { services: [buildService()] },
        [AVAILABILITY_PATH]: {
          timezone: 'Europe/Madrid',
          days: [{ date: '2026-10-07', slots: [] }],
        },
      });
      renderScreen(<BookSlotScreen />);

      expect(await screen.findByText(/No hay horas libres en los próximos días/)).toBeOnTheScreen();
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
        startsAt: SLOT_STARTS_AT,
        staffMembershipId: STAFF_MEMBERSHIP_ID,
        staffName: 'Álex Moreno',
      });
    });

    it('summarizes service, time, professional and price', async () => {
      mockApi({ [SERVICES_PATH]: { services: [buildService()] } });
      renderScreen(<BookConfirmScreen />);

      expect(await screen.findByText('Entrenamiento personal · 1 h')).toBeOnTheScreen();
      expect(screen.getByText('jue 8 oct · 18:00')).toBeOnTheScreen();
      expect(screen.getByText('Álex Moreno')).toBeOnTheScreen();
      expect(screen.getByText('35 €')).toBeOnTheScreen();
    });

    it('books with an idempotency key and opens the confirmation', async () => {
      mockApi({
        [SERVICES_PATH]: { services: [buildService()] },
        [CREATE_BOOKING_PATH]: buildBooking(),
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
      expect(findApiCall('POST', `/v1/centers/${NORTE_CENTER_ID}/bookings`)?.body).toEqual({
        serviceId: SERVICE_ID,
        startsAt: SLOT_STARTS_AT,
        staffMembershipId: STAFF_MEMBERSHIP_ID,
      });
      const [, requestInit] = jest
        .mocked(apiMutator)
        .mock.calls.find(([path]) => path.endsWith('/bookings')) ?? ['', {}];
      expect((requestInit.headers as Record<string, string>)['Idempotency-Key']).toMatch(
        /^[0-9a-f-]{36}$/,
      );
    });

    it('shows why it failed when the hour was taken meanwhile and stays on the screen', async () => {
      mockApi({
        [SERVICES_PATH]: { services: [buildService()] },
        [CREATE_BOOKING_PATH]: () => {
          throw buildApiError('SLOT_UNAVAILABLE', 409);
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
});
